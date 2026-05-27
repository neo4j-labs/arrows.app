#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = resolve(__dirname, '..', 'dist', 'server.js');
const fixturePath = resolve(__dirname, '..', '..', '..', 'fixtures', 'examples', 'social.arrows');
const fixture = readFileSync(fixturePath, 'utf8');

const srv = spawn('node', [serverPath], { stdio: ['pipe', 'pipe', 'inherit'] });

let buf = '';
const responses = new Map();
srv.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl);
    buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      if (msg.id != null && responses.has(msg.id)) {
        const { resolve: r } = responses.get(msg.id);
        responses.delete(msg.id);
        r(msg);
      }
    } catch {
      // non-JSON line; ignore
    }
  }
});

let nextId = 1;
function call(method, params) {
  const id = nextId++;
  const req = { jsonrpc: '2.0', id, method, params };
  return new Promise((resolve, reject) => {
    responses.set(id, { resolve, reject });
    srv.stdin.write(JSON.stringify(req) + '\n');
    setTimeout(() => {
      if (responses.has(id)) {
        responses.delete(id);
        reject(new Error(`timeout for ${method}`));
      }
    }, 10000);
  });
}

const fail = (msg) => { process.stderr.write(`[smoke] FAIL: ${msg}\n`); srv.kill(); process.exit(1); };
const ok = (msg) => process.stdout.write(`[smoke] OK: ${msg}\n`);

try {
  // 1. initialize
  await call('initialize', {
    protocolVersion: '2024-11-05',
    clientInfo: { name: 'smoke', version: '0.0.0' },
    capabilities: {},
  });
  ok('initialized');

  // 2. tools/list
  const tools = await call('tools/list', {});
  const names = tools.result.tools.map((t) => t.name);
  const expected = ['render_arrows', 'validate_arrows', 'apply_patch', 'layout_graph', 'describe_schema', 'export_cypher'];
  for (const n of expected) {
    if (!names.includes(n)) fail(`tools/list missing ${n}`);
  }
  ok(`tools/list returned ${names.length} tools`);

  // 3. render_arrows
  const render = await call('tools/call', { name: 'render_arrows', arguments: { graph: fixture } });
  const img = render.result.content.find((c) => c.type === 'image');
  if (!img) fail('render_arrows returned no image content');
  if (img.mimeType !== 'image/svg+xml') fail(`expected image/svg+xml, got ${img.mimeType}`);
  if (!img.data || img.data.length < 100) fail('image data too small');
  ok(`render_arrows → ${img.mimeType}, ${img.data.length}b base64`);

  // 4. validate_arrows
  const validate = await call('tools/call', { name: 'validate_arrows', arguments: { graph: fixture } });
  const validateBody = JSON.parse(validate.result.content[0].text);
  if (!Array.isArray(validateBody.diagnostics)) fail('validate_arrows returned no diagnostics array');
  ok(`validate_arrows → ${validateBody.diagnostics.length} diagnostic(s)`);

  // 5. describe_schema
  const schema = await call('tools/call', { name: 'describe_schema', arguments: { graph: fixture } });
  const schemaBody = JSON.parse(schema.result.content[0].text);
  if (!schemaBody.labels?.includes('User')) fail(`describe_schema missing User label: ${JSON.stringify(schemaBody)}`);
  ok(`describe_schema → labels=${schemaBody.labels.join(',')}`);

  // 6. export_cypher
  const cypher = await call('tools/call', { name: 'export_cypher', arguments: { graph: fixture } });
  const cypherBody = JSON.parse(cypher.result.content[0].text);
  if (!cypherBody.cypher?.includes('CREATE')) fail('export_cypher missing CREATE');
  if (!cypherBody.cypher?.includes(':User')) fail('export_cypher missing :User');
  ok(`export_cypher → ${cypherBody.cypher.length}b Cypher`);

  // 7. apply_patch
  const patch = await call('tools/call', {
    name: 'apply_patch',
    arguments: {
      graph: fixture,
      ops: [{ type: 'addNode', id: 'nNew', x: 500, y: 500, caption: 'Smoke', labels: ['Test'] }],
    },
  });
  const patchBody = JSON.parse(patch.result.content[0].text);
  if (patchBody.errors?.length) fail(`apply_patch errors: ${JSON.stringify(patchBody.errors)}`);
  if (!patchBody.graph?.includes('"id": "nNew"')) fail('apply_patch did not add node');
  ok('apply_patch → addNode applied');

  // 8. resources/list
  const resources = await call('resources/list', {});
  if (!resources.result?.resources?.length) fail('resources/list returned empty');
  ok(`resources/list → ${resources.result.resources.length} resource(s)`);

  process.stdout.write('[smoke] PASS\n');
  srv.kill();
  process.exit(0);
} catch (e) {
  fail(e?.message ?? String(e));
}
