// Square grid layout. Cells are nodes sorted by id, packed row-by-row in a
// roughly-square shape. Cheap visual reset for graphs that need a clean slate.

import type { LayoutFn } from './types';
import { applyPositions, round1 } from './types';

const CELL_SIZE = 320;

export const grid: LayoutFn = async (graph) => {
  if (graph.nodes.length === 0) return graph;
  const ids = graph.nodes.map((n) => n.id).sort();
  const cols = Math.ceil(Math.sqrt(ids.length));
  const rows = Math.ceil(ids.length / cols);
  const offsetX = -((cols - 1) * CELL_SIZE) / 2;
  const offsetY = -((rows - 1) * CELL_SIZE) / 2;
  const positions = new Map<string, { x: number; y: number }>();
  for (let i = 0; i < ids.length; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    positions.set(ids[i], {
      x: round1(offsetX + c * CELL_SIZE),
      y: round1(offsetY + r * CELL_SIZE),
    });
  }
  return applyPositions(graph, positions);
};
