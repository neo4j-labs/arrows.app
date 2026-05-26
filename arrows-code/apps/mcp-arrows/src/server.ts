#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Buffer } from 'node:buffer';
import {
  applyPatch,
  applyPatchInputJsonSchema,
  describeSchema,
  exportArrowsCypher,
  graphInputJsonSchema,
  renderArrows,
  validateArrows,
} from './lib/tools';
import { listResources, readResource } from './lib/resources';

const server = new Server(
  { name: 'arrows-code', version: '0.0.1' },
  { capabilities: { tools: {}, resources: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'render_arrows',
      description:
        'Render an arrows graph (native JSON) and return the diagram as an inline SVG image so the model and chat can display it. Output is image/svg+xml — Claude renders this inline. Also returns width, height, and parse diagnostics.',
      inputSchema: graphInputJsonSchema,
    },
    {
      name: 'render_arrows_svg',
      description:
        'Same as render_arrows but returns the raw SVG string in a text block — useful for piping to disk, embedding in HTML, or programmatic post-processing.',
      inputSchema: graphInputJsonSchema,
    },
    {
      name: 'validate_arrows',
      description:
        'Parse + structurally validate a graph. Surfaces parse errors plus duplicate ids, dangling relationship references, missing required fields, and unknown style keys. Never throws.',
      inputSchema: graphInputJsonSchema,
    },
    {
      name: 'apply_patch',
      description:
        'Apply structured edit ops (addNode, removeNode, movePos, setCaption, setProperty, addRelationship, renameLabel, renameRelType, etc.) to a graph and return the new graph JSON. Token-cheap alternative to rewriting whole files.',
      inputSchema: applyPatchInputJsonSchema,
    },
    {
      name: 'describe_schema',
      description:
        'Extract the schema (labels, relationship types, properties per label, direction frequency) from a graph. Use before adding entities to avoid duplicating labels that already exist.',
      inputSchema: graphInputJsonSchema,
    },
    {
      name: 'export_cypher',
      description:
        'Emit Cypher CREATE statements for the graph. Uses the same generator arrows.app ships, so output deploys cleanly to a real Neo4j database.',
      inputSchema: graphInputJsonSchema,
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case 'render_arrows': {
        const { svg, width, height, diagnostics } = await renderArrows(args);
        const data = Buffer.from(svg, 'utf8').toString('base64');
        return {
          content: [
            { type: 'image', data, mimeType: 'image/svg+xml' },
            { type: 'text', text: JSON.stringify({ width, height, diagnostics }) },
          ],
        };
      }
      case 'render_arrows_svg': {
        return { content: [{ type: 'text', text: JSON.stringify(await renderArrows(args)) }] };
      }
      case 'validate_arrows':
        return { content: [{ type: 'text', text: JSON.stringify(await validateArrows(args)) }] };
      case 'apply_patch':
        return { content: [{ type: 'text', text: JSON.stringify(applyPatch(args)) }] };
      case 'describe_schema':
        return { content: [{ type: 'text', text: JSON.stringify(describeSchema(args)) }] };
      case 'export_cypher':
        return { content: [{ type: 'text', text: JSON.stringify(exportArrowsCypher(args)) }] };
      default:
        return { isError: true, content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: 'text', text: error instanceof Error ? error.message : 'Unknown error' }],
    };
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources: listResources() }));
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  try {
    return readResource(request.params.uri);
  } catch (error) {
    // Without this, an unknown URI surfaces as an opaque SDK-level protocol
    // error; wrap it so the client sees the actual reason.
    throw new Error(error instanceof Error ? error.message : 'Unknown resource');
  }
});

const transport = new StdioServerTransport();
server.connect(transport).catch((err: unknown) => {
  process.stderr.write(
    `[mcp-arrows] server.connect failed: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`,
  );
  process.exit(1);
});
