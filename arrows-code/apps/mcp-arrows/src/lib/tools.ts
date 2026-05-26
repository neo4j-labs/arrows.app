import { z } from 'zod';
import { readGraph, writeGraph } from '@arrows-code/format-json';
import { renderGraphToSvg } from '@arrows-code/renderer-host';
import { apply } from '@arrows-code/patch';
import type { PatchOp } from '@arrows-code/patch';
import { validate as validateGraph } from '@arrows-code/validator';
import { exportCypher } from '@arrows-code/format-cypher';

const GraphInput = z.object({ graph: z.string().describe('arrows native JSON as a string (file content)') });
export type GraphInput = z.infer<typeof GraphInput>;

export const graphInputJsonSchema = {
  type: 'object',
  properties: { graph: { type: 'string', description: 'arrows native JSON as a string (file content)' } },
  required: ['graph'],
} as const;

// Discriminated union mirroring PatchOp in @arrows-code/patch.
const PatchOpSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('addNode'), id: z.string(), x: z.number(), y: z.number(),
    caption: z.string().optional(), labels: z.array(z.string()).optional(),
    properties: z.record(z.string()).optional(), style: z.record(z.string()).optional() }),
  z.object({ type: z.literal('removeNode'), id: z.string() }),
  z.object({ type: z.literal('movePos'), id: z.string(), dx: z.number(), dy: z.number() }),
  z.object({ type: z.literal('setPos'), id: z.string(), x: z.number(), y: z.number() }),
  z.object({ type: z.literal('setCaption'), id: z.string(), caption: z.string() }),
  z.object({ type: z.literal('addLabel'), id: z.string(), label: z.string() }),
  z.object({ type: z.literal('removeLabel'), id: z.string(), label: z.string() }),
  z.object({ type: z.literal('renameLabel'), oldLabel: z.string(), newLabel: z.string() }),
  z.object({ type: z.literal('setProperty'), id: z.string(), key: z.string(), value: z.string() }),
  z.object({ type: z.literal('removeProperty'), id: z.string(), key: z.string() }),
  z.object({ type: z.literal('setStyle'), id: z.string().nullable(), key: z.string(), value: z.string() }),
  z.object({ type: z.literal('addRelationship'), id: z.string(), fromId: z.string(), toId: z.string(),
    relType: z.string(), properties: z.record(z.string()).optional(), style: z.record(z.string()).optional() }),
  z.object({ type: z.literal('removeRelationship'), id: z.string() }),
  z.object({ type: z.literal('setRelType'), id: z.string(), relType: z.string() }),
  z.object({ type: z.literal('renameRelType'), oldType: z.string(), newType: z.string() }),
]);

const ApplyPatchInput = z.object({
  graph: z.string().describe('arrows native JSON as a string'),
  ops: z.array(PatchOpSchema).describe('Array of PatchOp objects'),
});

export const applyPatchInputJsonSchema = {
  type: 'object',
  properties: {
    graph: { type: 'string' },
    ops: {
      type: 'array',
      items: { type: 'object' },
      description: 'PatchOp[] — tagged-union ops (addNode, removeNode, movePos, setPos, setCaption, addLabel, removeLabel, renameLabel, setProperty, removeProperty, setStyle, addRelationship, removeRelationship, setRelType, renameRelType)',
    },
  },
  required: ['graph', 'ops'],
} as const;

export async function renderArrows(rawInput: unknown): Promise<{ svg: string; width: number; height: number; diagnostics: unknown[] }> {
  const { graph: text } = GraphInput.parse(rawInput);
  const { graph, diagnostics } = readGraph(text);
  const result = await renderGraphToSvg(graph);
  return { ...result, diagnostics };
}

export async function validateArrows(rawInput: unknown): Promise<{ diagnostics: unknown[] }> {
  const { graph: text } = GraphInput.parse(rawInput);
  const { graph, diagnostics: parseDiagnostics } = readGraph(text);
  const semanticDiagnostics = validateGraph(graph);
  return { diagnostics: [...parseDiagnostics, ...semanticDiagnostics] };
}

export function applyPatch(rawInput: unknown): { graph: string; errors: unknown[]; diagnostics: unknown[] } {
  const { graph: text, ops } = ApplyPatchInput.parse(rawInput);
  const { graph, diagnostics } = readGraph(text);
  const result = apply(graph, ops as unknown as PatchOp[]);
  return {
    graph: writeGraph(result.graph),
    errors: result.errors,
    diagnostics,
  };
}

export function describeSchema(rawInput: unknown): {
  labels: string[];
  relTypes: string[];
  propsByLabel: Record<string, string[]>;
  relsByDirection: Array<{ fromLabel: string; toLabel: string; type: string; count: number }>;
} {
  const { graph: text } = GraphInput.parse(rawInput);
  const { graph } = readGraph(text);

  const labels = new Set<string>();
  const relTypes = new Set<string>();
  const propsByLabel: Record<string, Set<string>> = {};
  const nodeLabels = new Map<string, string[]>();

  for (const node of graph.nodes) {
    for (const label of node.labels) {
      labels.add(label);
      propsByLabel[label] ??= new Set();
      for (const propKey of Object.keys(node.properties)) propsByLabel[label].add(propKey);
    }
    nodeLabels.set(node.id, node.labels);
  }

  const directionCounts = new Map<string, number>();
  for (const rel of graph.relationships) {
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
      Object.entries(propsByLabel).map(([k, v]) => [k, [...v].sort()]),
    ),
    relsByDirection: [...directionCounts.entries()].map(([key, count]) => {
      const [fromLabel, toLabel, type] = key.split('|');
      return { fromLabel, toLabel, type, count };
    }),
  };
}

export function exportArrowsCypher(rawInput: unknown): { cypher: string } {
  const { graph: text } = GraphInput.parse(rawInput);
  const { graph } = readGraph(text);
  return { cypher: exportCypher(graph, 'CREATE', { includeStyling: false }) };
}
