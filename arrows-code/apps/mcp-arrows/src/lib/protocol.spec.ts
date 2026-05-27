import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SERVER_PATH = resolve(__dirname, '..', '..', 'dist', 'server.js');

// Skip when the bundled server hasn't been built yet — keeps the suite fast
// for unit-only test runs while still proving the end-to-end MCP contract
// post-build (used by CI + the install:local flow).
const runOrSkip = existsSync(SERVER_PATH) ? describe : describe.skip;

runOrSkip('MCP protocol contract (built server)', () => {
  let srv: ChildProcess;
  let stderr = '';
  let nextId = 1;
  const pending = new Map<number, (msg: unknown) => void>();
  let buf = '';

  const call = (method: string, params: unknown): Promise<unknown> => {
    const id = nextId++;
    return new Promise((res, rej) => {
      pending.set(id, (msg) => res(msg));
      srv.stdin!.write(
        JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n'
      );
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          rej(new Error(`timeout: ${method}`));
        }
      }, 5000);
    });
  };

  beforeAll(async () => {
    srv = spawn('node', [SERVER_PATH], { stdio: ['pipe', 'pipe', 'pipe'] });
    srv.stderr!.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    srv.stdout!.on('data', (chunk) => {
      buf += chunk.toString();
      let nl: number;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line) as { id?: number };
          if (typeof msg.id === 'number' && pending.has(msg.id)) {
            const cb = pending.get(msg.id)!;
            pending.delete(msg.id);
            cb(msg);
          }
        } catch {
          /* non-JSON line */
        }
      }
    });
    await call('initialize', {
      protocolVersion: '2024-11-05',
      clientInfo: { name: 'spec', version: '0' },
      capabilities: {},
    });
  });

  afterAll(() => {
    srv?.kill();
  });

  it('tools/list advertises every tool with inputSchema AND outputSchema', async () => {
    const resp = (await call('tools/list', {})) as {
      result: {
        tools: Array<{
          name: string;
          inputSchema: unknown;
          outputSchema?: unknown;
        }>;
      };
    };
    const tools = resp.result.tools;
    const expected = [
      'render_arrows',
      'validate_arrows',
      'apply_patch',
      'layout_graph',
      'describe_schema',
      'export_cypher',
    ];
    for (const name of expected) {
      const tool = tools.find((t) => t.name === name);
      expect(tool, `tool ${name} missing`).toBeDefined();
      expect(tool!.inputSchema).toBeDefined();
      expect(
        tool!.outputSchema,
        `outputSchema missing on ${name}`
      ).toBeDefined();
    }
  });

  it('apply_patch input schema exposes the PatchOp discriminated union (no opaque { type: "object" })', async () => {
    const resp = (await call('tools/list', {})) as {
      result: {
        tools: Array<{
          name: string;
          inputSchema: {
            properties?: { ops?: { items?: { oneOf?: unknown[] } } };
          };
        }>;
      };
    };
    const tool = resp.result.tools.find((t) => t.name === 'apply_patch')!;
    const opsItems = tool.inputSchema.properties?.ops?.items;
    expect(opsItems).toBeDefined();
    expect(Array.isArray((opsItems as { oneOf?: unknown[] }).oneOf)).toBe(true);
    expect(
      (opsItems as { oneOf: unknown[] }).oneOf.length
    ).toBeGreaterThanOrEqual(15);
  });

  it('resources/list returns every static doc + auto-discovered example fixtures', async () => {
    const resp = (await call('resources/list', {})) as {
      result: { resources: Array<{ uri: string }> };
    };
    const uris = resp.result.resources.map((r) => r.uri);
    expect(uris).toContain('arrows://spec/cypher-mapping');
    expect(uris).toContain('arrows://spec/patch-ops');
    expect(uris).toContain('arrows://guide/workflow');
    // Example fixtures should be auto-enumerated by the ResourceTemplate's list callback.
    expect(uris).toContain('arrows://examples/social');
    expect(uris).toContain('arrows://examples/citations');
  });

  it('resources/templates/list advertises the example URI template', async () => {
    const resp = (await call('resources/templates/list', {})) as {
      result: { resourceTemplates: Array<{ uriTemplate: string }> };
    };
    const templates = resp.result.resourceTemplates.map((t) => t.uriTemplate);
    expect(templates).toContain('arrows://examples/{name}');
  });

  it('prompts/list advertises the three workflow prompts', async () => {
    const resp = (await call('prompts/list', {})) as {
      result: { prompts: Array<{ name: string }> };
    };
    const names = resp.result.prompts.map((p) => p.name);
    for (const expected of [
      'from-description',
      'from-cypher',
      'review-graph',
    ]) {
      expect(names).toContain(expected);
    }
  });

  it('prompts/get returns a message that references the workflow guide URI', async () => {
    const resp = (await call('prompts/get', {
      name: 'from-description',
      arguments: { domain: 'a tiny test domain' },
    })) as {
      result: {
        messages: Array<{
          role: string;
          content: { type: string; text: string };
        }>;
      };
    };
    expect(resp.result.messages.length).toBeGreaterThan(0);
    const text = resp.result.messages[0].content.text;
    expect(text).toContain('arrows://guide/workflow');
    expect(text).toContain('a tiny test domain');
  });

  it('tools/call returns structuredContent validated against outputSchema', async () => {
    const empty = JSON.stringify({ nodes: [], relationships: [], style: {} });
    const resp = (await call('tools/call', {
      name: 'validate_arrows',
      arguments: { graph: empty },
    })) as {
      result: { structuredContent: { diagnostics: unknown[] } };
    };
    expect(resp.result.structuredContent).toBeDefined();
    expect(Array.isArray(resp.result.structuredContent.diagnostics)).toBe(true);
  });

  it('does NOT spam "Not implemented: getContext" on stderr during render', async () => {
    const fixture = readFileSync(
      resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'fixtures',
        'examples',
        'social.arrows'
      ),
      'utf8'
    );
    stderr = '';
    await call('tools/call', {
      name: 'render_arrows',
      arguments: { graph: fixture },
    });
    expect(stderr).not.toMatch(/Not implemented.*getContext/);
  });
});
