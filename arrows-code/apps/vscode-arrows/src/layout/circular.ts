// All nodes on a single ring, sorted by id. Distinct visual; useful when you
// want to show "all relationships at once" without hierarchy.

import type { LayoutFn } from './types';
import { applyPositions, round1 } from './types';

const MIN_RADIUS = 300;
const PER_NODE_RADIUS = 70;

export const circular: LayoutFn = async (graph) => {
  if (graph.nodes.length === 0) return graph;
  if (graph.nodes.length === 1) {
    return { ...graph, nodes: [{ ...graph.nodes[0], position: { x: 0, y: 0 } }] };
  }

  const sortedIds = graph.nodes.map((n) => n.id).sort();
  const radius = Math.max(MIN_RADIUS, sortedIds.length * PER_NODE_RADIUS);
  const positions = new Map<string, { x: number; y: number }>();
  for (let i = 0; i < sortedIds.length; i++) {
    const angle = (i / sortedIds.length) * Math.PI * 2 - Math.PI / 2;
    positions.set(sortedIds[i], {
      x: round1(Math.cos(angle) * radius),
      y: round1(Math.sin(angle) * radius),
    });
  }
  return applyPositions(graph, positions);
};
