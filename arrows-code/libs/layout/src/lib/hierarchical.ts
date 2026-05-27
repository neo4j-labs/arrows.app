// Sugiyama-lite hierarchical layout. Longest-path layering via Kahn's topological
// sort. Cyclic graphs are tolerated — back-edges into already-layered nodes are
// ignored, and any node stuck in a pure cycle lands in an outer "leftover" layer
// past all the DAG-reachable ones. Guarantees termination on any input.

import type { LayoutFn } from './types';
import { applyPositions, round1 } from './types';

const LAYER_HEIGHT = 280;
const NODE_SPACING = 340;

export const hierarchical: LayoutFn = async (graph) => {
  if (graph.nodes.length === 0) return graph;
  const ids = graph.nodes.map((n) => n.id).sort();
  const idSet = new Set(ids);

  // Compute in-degree (ignoring self-loops + dangling refs) and adjacency-out.
  const inDeg = new Map<string, number>();
  const edgesOut = new Map<string, string[]>();
  for (const id of ids) { inDeg.set(id, 0); edgesOut.set(id, []); }
  for (const r of graph.relationships) {
    if (r.fromId === r.toId) continue;
    if (!idSet.has(r.fromId) || !idSet.has(r.toId)) continue;
    inDeg.set(r.toId, (inDeg.get(r.toId) ?? 0) + 1);
    edgesOut.get(r.fromId)!.push(r.toId);
  }

  // Kahn-style longest-path layering. `tentative` carries the running max of
  // (predecessorLayer + 1) for each unfinalized node; we only commit a node's
  // layer when ALL its incoming edges have been processed (remaining→0).
  const remaining = new Map(inDeg);
  const tentative = new Map<string, number>();
  const layer = new Map<string, number>();
  let frontier = ids.filter((id) => (remaining.get(id) ?? 0) === 0);
  for (const id of frontier) layer.set(id, 0);

  while (frontier.length > 0) {
    const next: string[] = [];
    for (const id of frontier) {
      const L = layer.get(id)!;
      for (const target of edgesOut.get(id) ?? []) {
        if (layer.has(target)) continue; // back-edge into a layered node
        const candidate = L + 1;
        tentative.set(target, Math.max(tentative.get(target) ?? 0, candidate));
        const remainingForTarget = (remaining.get(target) ?? 0) - 1;
        remaining.set(target, remainingForTarget);
        if (remainingForTarget <= 0) {
          layer.set(target, tentative.get(target)!);
          next.push(target);
        }
      }
    }
    frontier = next;
  }

  // Anything still unlayered (pure cycles, no source) → outer leftover layer.
  const maxLayer = Math.max(0, ...layer.values());
  for (const id of ids) if (!layer.has(id)) layer.set(id, maxLayer + 1);

  // Group, sort within layer by id for determinism, position.
  const byLayer = new Map<number, string[]>();
  for (const id of ids) {
    const L = layer.get(id)!;
    if (!byLayer.has(L)) byLayer.set(L, []);
    byLayer.get(L)!.push(id);
  }
  for (const arr of byLayer.values()) arr.sort();

  const layers = [...byLayer.keys()].sort((a, b) => a - b);
  const positions = new Map<string, { x: number; y: number }>();
  for (const L of layers) {
    const arr = byLayer.get(L)!;
    const offsetX = -((arr.length - 1) * NODE_SPACING) / 2;
    for (let i = 0; i < arr.length; i++) {
      positions.set(arr[i], { x: round1(offsetX + i * NODE_SPACING), y: round1(L * LAYER_HEIGHT) });
    }
  }

  return applyPositions(graph, positions);
};
