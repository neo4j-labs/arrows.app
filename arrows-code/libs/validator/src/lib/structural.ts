import { styleAttributes } from '@neo4j-arrows/model';
import type { Graph } from '@neo4j-arrows/model';
import { CODES } from './types';
import type { Diagnostic } from './types';

// Style-value validation delegates to @neo4j-arrows/model so the vocabulary stays in sync automatically.
export function checkStructural(graph: Graph): Diagnostic[] {
  return [
    ...checkDuplicateIds(graph),
    ...checkRefIntegrity(graph),
    ...checkRequiredFields(graph),
    ...checkStyleKeys(graph),
  ];
}

function checkDuplicateIds(graph: Graph): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const seenNodes = new Set<string>();
  for (const node of graph.nodes) {
    if (seenNodes.has(node.id)) {
      diagnostics.push({
        severity: 'error',
        code: CODES.duplicateId,
        message: `Duplicate node id: ${node.id}`,
        anchor: { kind: 'node', id: node.id },
      });
    }
    seenNodes.add(node.id);
  }
  const seenRels = new Set<string>();
  for (const rel of graph.relationships) {
    if (seenRels.has(rel.id)) {
      diagnostics.push({
        severity: 'error',
        code: CODES.duplicateId,
        message: `Duplicate relationship id: ${rel.id}`,
        anchor: { kind: 'relationship', id: rel.id },
      });
    }
    seenRels.add(rel.id);
  }
  return diagnostics;
}

function checkRefIntegrity(graph: Graph): Diagnostic[] {
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  const diagnostics: Diagnostic[] = [];
  for (const rel of graph.relationships) {
    if (!nodeIds.has(rel.fromId)) {
      diagnostics.push({
        severity: 'error',
        code: CODES.refIntegrity,
        message: `Relationship ${rel.id} references unknown fromId "${rel.fromId}"`,
        anchor: { kind: 'relationship', id: rel.id },
      });
    }
    if (!nodeIds.has(rel.toId)) {
      diagnostics.push({
        severity: 'error',
        code: CODES.refIntegrity,
        message: `Relationship ${rel.id} references unknown toId "${rel.toId}"`,
        anchor: { kind: 'relationship', id: rel.id },
      });
    }
  }
  return diagnostics;
}

function checkRequiredFields(graph: Graph): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const node of graph.nodes) {
    if (!node.id) {
      diagnostics.push({
        severity: 'error',
        code: CODES.emptyRequired,
        message: 'Node missing required id',
        anchor: { kind: 'node' },
      });
    }
    if (!node.position) {
      diagnostics.push({
        severity: 'error',
        code: CODES.emptyRequired,
        message: `Node ${node.id} missing required position`,
        anchor: { kind: 'node', id: node.id },
      });
    }
  }
  for (const rel of graph.relationships) {
    if (!rel.id || !rel.fromId || !rel.toId || !rel.type) {
      diagnostics.push({
        severity: 'error',
        code: CODES.emptyRequired,
        message: `Relationship ${rel.id ?? '<no id>'} missing required field(s) — id/fromId/toId/type`,
        anchor: { kind: 'relationship', id: rel.id },
      });
    }
  }
  return diagnostics;
}

function checkStyleKeys(graph: Graph): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const knownKeys = new Set(Object.keys(styleAttributes));

  const checkBlock = (
    style: Record<string, unknown> | undefined,
    scope: 'graph' | 'node' | 'relationship',
    id?: string,
  ): void => {
    if (!style) return;
    for (const key of Object.keys(style)) {
      if (!knownKeys.has(key)) {
        diagnostics.push({
          severity: 'warning',
          code: CODES.styleKeyUnknown,
          message: `Unknown style key "${key}" on ${scope}${id ? ` ${id}` : ''}`,
          anchor: { kind: 'style', id, key },
        });
      }
    }
  };

  checkBlock(graph.style as Record<string, unknown>, 'graph');
  for (const node of graph.nodes) checkBlock(node.style, 'node', node.id);
  for (const rel of graph.relationships) checkBlock(rel.style, 'relationship', rel.id);

  return diagnostics;
}
