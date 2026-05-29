import { Point } from '@neo4j-arrows/model';
import type { Graph, Node, Relationship } from '@neo4j-arrows/model';
import type { ReadDiagnostic, ReadResult } from './types';

const CODES = {
  parseError: 'format-json.parse-error',
  invalidShape: 'format-json.invalid-shape',
  orphanRel: 'format-json.orphan-relationship',
} as const;

const emptyResult = (diagnostic: ReadDiagnostic): ReadResult => ({
  graph: { nodes: [], relationships: [], style: {} },
  diagnostics: [diagnostic],
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export function readGraph(text: string): ReadResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return emptyResult({
      severity: 'error',
      code: CODES.parseError,
      message: `Failed to parse JSON: ${error instanceof Error ? error.message : 'unknown error'}`,
    });
  }

  if (parsed === null) {
    return { graph: { nodes: [], relationships: [], style: {} }, diagnostics: [] };
  }

  if (!isRecord(parsed)) {
    return emptyResult({
      severity: 'error',
      code: CODES.invalidShape,
      message: 'Top-level JSON must be an object',
    });
  }

  const rawGraph: Record<string, unknown> = isRecord(parsed['graph']) ? parsed['graph'] : parsed;

  const diagnostics: ReadDiagnostic[] = [];
  const nodes = readNodes(rawGraph['nodes'], diagnostics);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const relationships = readRelationships(rawGraph['relationships'], nodeIds, diagnostics);
  const style = isRecord(rawGraph['style']) ? (rawGraph['style'] as Graph['style']) : {};

  return { graph: { nodes, relationships, style }, diagnostics };
}

function readNodes(raw: unknown, diagnostics: ReadDiagnostic[]): Node[] {
  if (!Array.isArray(raw)) {
    if (raw !== undefined) {
      diagnostics.push({
        severity: 'error',
        code: CODES.invalidShape,
        message: 'nodes must be an array',
        path: 'nodes',
      });
    }
    return [];
  }

  return raw.flatMap((rawNode, index): Node[] => {
    if (!isRecord(rawNode)) {
      diagnostics.push({
        severity: 'warning',
        code: CODES.invalidShape,
        message: 'node entry is not an object',
        path: `nodes[${index}]`,
      });
      return [];
    }
    const position = readPoint(rawNode['position']);
    return [
      {
        entityType: 'Node',
        id: String(rawNode['id'] ?? `n${index}`),
        position,
        caption: typeof rawNode['caption'] === 'string' ? rawNode['caption'] : '',
        labels: Array.isArray(rawNode['labels']) ? (rawNode['labels'] as string[]) : [],
        properties: isRecord(rawNode['properties'])
          ? (rawNode['properties'] as Record<string, string>)
          : {},
        style: isRecord(rawNode['style'])
          ? (rawNode['style'] as Record<string, string>)
          : {},
      },
    ];
  });
}

function readRelationships(
  raw: unknown,
  nodeIds: Set<string>,
  diagnostics: ReadDiagnostic[],
): Relationship[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.flatMap((rawRel, index): Relationship[] => {
    if (!isRecord(rawRel)) {
      return [];
    }
    const fromId = String(rawRel['fromId'] ?? '');
    const toId = String(rawRel['toId'] ?? '');
    if (!nodeIds.has(fromId) || !nodeIds.has(toId)) {
      diagnostics.push({
        severity: 'warning',
        code: CODES.orphanRel,
        message: `Relationship ${rawRel['id'] ?? `r${index}`} references missing node(s); dropped`,
        path: `relationships[${index}]`,
      });
      return [];
    }
    return [
      {
        entityType: 'Relationship',
        id: String(rawRel['id'] ?? `r${index}`),
        fromId,
        toId,
        type: typeof rawRel['type'] === 'string' ? rawRel['type'] : '',
        properties: isRecord(rawRel['properties'])
          ? (rawRel['properties'] as Record<string, string>)
          : {},
        style: isRecord(rawRel['style'])
          ? (rawRel['style'] as Record<string, string>)
          : {},
      },
    ];
  });
}

function readPoint(raw: unknown): Point {
  if (isRecord(raw) && typeof raw['x'] === 'number' && typeof raw['y'] === 'number') {
    return new Point(raw['x'], raw['y']);
  }
  return new Point(0, 0);
}
