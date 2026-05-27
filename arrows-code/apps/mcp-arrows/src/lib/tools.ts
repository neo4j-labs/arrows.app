import { z } from 'zod';
import { readGraph, writeGraph } from '@arrows-code/format-json';
import { renderGraphToSvg } from '@arrows-code/renderer-host';
import { apply } from '@arrows-code/patch';
import type { PatchOp } from '@arrows-code/patch';
import { validate as validateGraph } from '@arrows-code/validator';
import { exportCypher } from '@arrows-code/format-cypher';
import { findLayout, LAYOUTS, type GraphIn } from '@arrows-code/layout';

// Zod raw shapes drive both runtime validation AND the JSON schema the MCP
// SDK advertises to clients — single source of truth, no hand-written JSON
// schema constants to drift.

// PatchOp discriminated union — mirrors @arrows-code/patch.
const PatchOpSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('addNode'),
    id: z.string(),
    x: z.number(),
    y: z.number(),
    caption: z.string().optional(),
    labels: z.array(z.string()).optional(),
    properties: z.record(z.string(), z.string()).optional(),
    style: z.record(z.string(), z.string()).optional(),
  }),
  z.object({ type: z.literal('removeNode'), id: z.string() }),
  z.object({
    type: z.literal('movePos'),
    id: z.string(),
    dx: z.number(),
    dy: z.number(),
  }),
  z.object({
    type: z.literal('setPos'),
    id: z.string(),
    x: z.number(),
    y: z.number(),
  }),
  z.object({
    type: z.literal('setCaption'),
    id: z.string(),
    caption: z.string(),
  }),
  z.object({ type: z.literal('addLabel'), id: z.string(), label: z.string() }),
  z.object({
    type: z.literal('removeLabel'),
    id: z.string(),
    label: z.string(),
  }),
  z.object({
    type: z.literal('renameLabel'),
    oldLabel: z.string(),
    newLabel: z.string(),
  }),
  z.object({
    type: z.literal('setProperty'),
    id: z.string(),
    key: z.string(),
    value: z
      .string()
      .describe('See arrows://spec/cypher-mapping for value encoding rules.'),
  }),
  z.object({
    type: z.literal('removeProperty'),
    id: z.string(),
    key: z.string(),
  }),
  z.object({
    type: z.literal('setStyle'),
    id: z.string().nullable().describe('null = graph-level style'),
    key: z.string(),
    value: z.string(),
  }),
  z.object({
    type: z.literal('addRelationship'),
    id: z.string(),
    fromId: z.string(),
    toId: z.string(),
    relType: z.string(),
    properties: z.record(z.string(), z.string()).optional(),
    style: z.record(z.string(), z.string()).optional(),
  }),
  z.object({ type: z.literal('removeRelationship'), id: z.string() }),
  z.object({
    type: z.literal('setRelType'),
    id: z.string(),
    relType: z.string(),
  }),
  z.object({
    type: z.literal('renameRelType'),
    oldType: z.string(),
    newType: z.string(),
  }),
]);

const LayoutId = z.enum([
  'force',
  'hierarchical',
  'radial',
  'circular',
  'grid',
]);

// Input shapes — passed as `inputSchema` to registerTool.
export const graphInputShape = {
  graph: z.string().describe('arrows native JSON as a string (file content)'),
} as const;

export const applyPatchInputShape = {
  graph: z.string().describe('arrows native JSON as a string'),
  ops: z
    .array(PatchOpSchema)
    .describe(
      'PatchOp[] — tagged-union ops. See arrows://spec/patch-ops for semantics. Ops apply in order; failed ops surface in `errors` without short-circuiting.'
    ),
} as const;

export const layoutInputShape = {
  graph: z.string().describe('arrows native JSON as a string'),
  layout: LayoutId.describe(
    'Which layout algorithm to apply. See arrows://spec/layouts.'
  ),
} as const;

// Output shapes — passed as `outputSchema` so clients get a contract for the
// returned `structuredContent`. Eliminates "is the field name `diagnostics` or
// `errors`?" guessing that caused the eval agent's crash.
const Diagnostic = z
  .object({ severity: z.string(), message: z.string() })
  .passthrough();

export const renderArrowsOutputShape = {
  svg: z.string(),
  width: z.number(),
  height: z.number(),
  diagnostics: z.array(Diagnostic),
} as const;

export const validateArrowsOutputShape = {
  diagnostics: z.array(Diagnostic),
} as const;

export const applyPatchOutputShape = {
  graph: z.string(),
  errors: z.array(Diagnostic),
  diagnostics: z.array(Diagnostic),
} as const;

export const describeSchemaOutputShape = {
  labels: z.array(z.string()),
  relTypes: z.array(z.string()),
  propsByLabel: z.record(z.string(), z.array(z.string())),
  relsByDirection: z.array(
    z.object({
      fromLabel: z.string(),
      toLabel: z.string(),
      type: z.string(),
      count: z.number(),
    })
  ),
} as const;

export const layoutGraphOutputShape = {
  graph: z.string(),
  layout: LayoutId,
  nodeCount: z.number(),
} as const;

export const exportCypherOutputShape = {
  cypher: z.string(),
} as const;

// Impl — accept already-parsed args from the SDK, but defensively re-parse so
// the same functions remain callable from tests with untyped fixtures.
type GraphInput = { graph: string };
type ApplyPatchInput = z.infer<z.ZodObject<typeof applyPatchInputShape>>;
type LayoutInput = z.infer<z.ZodObject<typeof layoutInputShape>>;

export async function renderArrows(
  input: GraphInput
): Promise<z.infer<z.ZodObject<typeof renderArrowsOutputShape>>> {
  const { graph } = z.object(graphInputShape).parse(input);
  const { graph: parsed, diagnostics } = readGraph(graph);
  const result = await renderGraphToSvg(parsed);
  return { ...result, diagnostics };
}

export async function validateArrows(
  input: GraphInput
): Promise<z.infer<z.ZodObject<typeof validateArrowsOutputShape>>> {
  const { graph } = z.object(graphInputShape).parse(input);
  const { graph: parsed, diagnostics: parseDiagnostics } = readGraph(graph);
  const semanticDiagnostics = validateGraph(parsed);
  return { diagnostics: [...parseDiagnostics, ...semanticDiagnostics] };
}

export function applyPatch(
  input: ApplyPatchInput
): z.infer<z.ZodObject<typeof applyPatchOutputShape>> {
  const { graph, ops } = z.object(applyPatchInputShape).parse(input);
  const { graph: parsed, diagnostics } = readGraph(graph);
  // Zod infers a structural equivalent of PatchOp[] — runtime shapes match.
  const result = apply(parsed, ops as PatchOp[]);
  return {
    graph: writeGraph(result.graph),
    errors: result.errors,
    diagnostics,
  };
}

export function describeSchema(
  input: GraphInput
): z.infer<z.ZodObject<typeof describeSchemaOutputShape>> {
  const { graph } = z.object(graphInputShape).parse(input);
  const { graph: parsed } = readGraph(graph);

  const labels = new Set<string>();
  const relTypes = new Set<string>();
  const propsByLabel: Record<string, Set<string>> = {};
  const nodeLabels = new Map<string, string[]>();

  for (const node of parsed.nodes) {
    for (const label of node.labels) {
      labels.add(label);
      propsByLabel[label] ??= new Set();
      for (const propKey of Object.keys(node.properties))
        propsByLabel[label].add(propKey);
    }
    nodeLabels.set(node.id, node.labels);
  }

  const directionCounts = new Map<string, number>();
  for (const rel of parsed.relationships) {
    relTypes.add(rel.type);
    const fromLabels = nodeLabels.get(rel.fromId) ?? ['<no-label>'];
    const toLabels = nodeLabels.get(rel.toId) ?? ['<no-label>'];
    for (const fl of fromLabels.length ? fromLabels : ['<no-label>']) {
      for (const tl of toLabels.length ? toLabels : ['<no-label>']) {
        const key = `${fl}|${tl}|${rel.type}`;
        directionCounts.set(key, (directionCounts.get(key) ?? 0) + 1);
      }
    }
  }

  return {
    labels: [...labels].sort(),
    relTypes: [...relTypes].sort(),
    propsByLabel: Object.fromEntries(
      Object.entries(propsByLabel).map(([k, v]) => [k, [...v].sort()])
    ),
    relsByDirection: [...directionCounts.entries()].map(([key, count]) => {
      const parts = key.split('|');
      return {
        fromLabel: parts[0] ?? '',
        toLabel: parts[1] ?? '',
        type: parts[2] ?? '',
        count,
      };
    }),
  };
}

export async function layoutGraph(
  input: LayoutInput
): Promise<z.infer<z.ZodObject<typeof layoutGraphOutputShape>>> {
  const { graph, layout } = z.object(layoutInputShape).parse(input);
  const chosen = findLayout(layout);
  if (!chosen) {
    throw new Error(
      `Unknown layout '${layout}'. Available: ${LAYOUTS.map((l) => l.id).join(
        ', '
      )}`
    );
  }
  const { graph: parsed } = readGraph(graph);
  // readGraph output is structurally compatible with GraphIn / writeGraph arg.
  const laidOut = await chosen.run(parsed as GraphIn);
  return {
    graph: writeGraph(laidOut as Parameters<typeof writeGraph>[0]),
    layout,
    nodeCount: parsed.nodes.length,
  };
}

export function exportArrowsCypher(
  input: GraphInput
): z.infer<z.ZodObject<typeof exportCypherOutputShape>> {
  const { graph } = z.object(graphInputShape).parse(input);
  const { graph: parsed } = readGraph(graph);
  return { cypher: exportCypher(parsed, 'CREATE', { includeStyling: false }) };
}
