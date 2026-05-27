// Force-directed layout (Eades / Fruchterman-Reingold style) with a hard-collision
// pass that uses per-node effective radii (caption + labels + properties).
// Deterministic: identical input ⇒ identical output.

import type { LayoutFn } from './types';
import { applyPositions, effectiveRadius, round1 } from './types';

const COLLISION_GAP = 40;
const TARGET_EDGE_LENGTH = 360;
const REPULSE_STRENGTH = 160_000;
const SPRING_STRENGTH = 0.04;
const CENTER_STRENGTH = 0.003;
const DAMPING = 0.82;
const ITERATIONS = 420;
const YIELD_EVERY = 50;

function readNum(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const nextTick = (): Promise<void> =>
  new Promise((r) => (typeof setImmediate !== 'undefined' ? setImmediate(r) : setTimeout(r, 0)));

export const forceDirected: LayoutFn = async (graph, onProgress) => {
  if (graph.nodes.length === 0) return graph;
  if (graph.nodes.length === 1) {
    return { ...graph, nodes: [{ ...graph.nodes[0], position: { x: 0, y: 0 } }] };
  }

  const sortedNodes = [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id));
  const sim = sortedNodes.map((n) => {
    const pos = (n.position ?? {}) as { x?: unknown; y?: unknown };
    return { id: n.id, x: readNum(pos.x, 0), y: readNum(pos.y, 0), vx: 0, vy: 0, r: effectiveRadius(n) };
  });
  const indexById = new Map(sim.map((n, i) => [n.id, i]));
  const edges: Array<{ a: number; b: number }> = [];
  for (const rel of graph.relationships) {
    const a = indexById.get(rel.fromId);
    const b = indexById.get(rel.toId);
    if (a === undefined || b === undefined || a === b) continue;
    edges.push({ a, b });
  }

  for (let step = 0; step < ITERATIONS; step++) {
    for (const n of sim) { n.vx *= DAMPING; n.vy *= DAMPING; }

    for (let i = 0; i < sim.length; i++) {
      for (let j = i + 1; j < sim.length; j++) {
        const a = sim[i];
        const b = sim[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist2 = dx * dx + dy * dy;
        if (dist2 < 1) { dx = j - i; dy = j + i; dist2 = dx * dx + dy * dy; }
        const dist = Math.sqrt(dist2);
        const force = REPULSE_STRENGTH / dist2;
        const ux = dx / dist;
        const uy = dy / dist;
        a.vx -= ux * force; a.vy -= uy * force;
        b.vx += ux * force; b.vy += uy * force;
      }
    }

    for (const { a: ai, b: bi } of edges) {
      const a = sim[ai];
      const b = sim[bi];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const delta = dist - TARGET_EDGE_LENGTH;
      const fx = (dx / dist) * delta * SPRING_STRENGTH;
      const fy = (dy / dist) * delta * SPRING_STRENGTH;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }

    for (const n of sim) { n.vx -= n.x * CENTER_STRENGTH; n.vy -= n.y * CENTER_STRENGTH; }
    for (const n of sim) { n.x += n.vx; n.y += n.vy; }

    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < sim.length; i++) {
        for (let j = i + 1; j < sim.length; j++) {
          const a = sim[i];
          const b = sim[j];
          const minDist = a.r + b.r + COLLISION_GAP;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
          if (dist >= minDist) continue;
          const overlap = (minDist - dist) / 2;
          const ux = dx / dist;
          const uy = dy / dist;
          a.x -= ux * overlap; a.y -= uy * overlap;
          b.x += ux * overlap; b.y += uy * overlap;
        }
      }
    }

    if (onProgress && (step % YIELD_EVERY === 0 || step === ITERATIONS - 1)) {
      onProgress((step + 1) / ITERATIONS);
      await nextTick();
    }
  }

  // Re-center bounding box on origin.
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of sim) {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x > maxX) maxX = n.x;
    if (n.y > maxY) maxY = n.y;
  }
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const positions: Array<[string, { x: number; y: number }]> = sim.map((n) =>
    [n.id, { x: round1(n.x - cx), y: round1(n.y - cy) }],
  );
  return applyPositions(graph, new Map(positions));
};
