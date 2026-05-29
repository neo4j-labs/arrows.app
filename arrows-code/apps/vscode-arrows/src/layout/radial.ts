// Radial tree, BFS-rings from highest-degree root: https://en.wikipedia.org/wiki/Radial_tree

import type { LayoutFn } from './types';
import { applyPositions, NODE_BODY_RADIUS, round1 } from './types';

const RING_GAP = 320;
const LATERAL_GAP = 60;

export const radial: LayoutFn = async (graph) => {
  if (graph.nodes.length === 0) return graph;
  if (graph.nodes.length === 1) {
    return { ...graph, nodes: [{ ...graph.nodes[0], position: { x: 0, y: 0 } }] };
  }

  const ids = graph.nodes.map((n) => n.id).sort();
  const idSet = new Set(ids);
  const adj = new Map<string, string[]>();
  for (const id of ids) adj.set(id, []);
  for (const r of graph.relationships) {
    if (r.fromId === r.toId) continue;
    if (!idSet.has(r.fromId) || !idSet.has(r.toId)) continue;
    adj.get(r.fromId)!.push(r.toId);
    adj.get(r.toId)!.push(r.fromId);
  }

  let center = ids[0];
  let maxDeg = -1;
  for (const id of ids) {
    const deg = adj.get(id)!.length;
    if (deg > maxDeg) { center = id; maxDeg = deg; }
  }

  const ring = new Map<string, number>();
  ring.set(center, 0);
  const queue: string[] = [center];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const r = ring.get(id)!;
    for (const nb of adj.get(id)!) {
      if (!ring.has(nb)) { ring.set(nb, r + 1); queue.push(nb); }
    }
  }
  const maxRing = Math.max(0, ...ring.values());
  for (const id of ids) if (!ring.has(id)) ring.set(id, maxRing + 1);

  const byRing = new Map<number, string[]>();
  for (const id of ids) {
    const R = ring.get(id)!;
    if (!byRing.has(R)) byRing.set(R, []);
    byRing.get(R)!.push(id);
  }
  for (const arr of byRing.values()) arr.sort();

  // Ring radius = max(index · RING_GAP, circumference / 2π for N nodes), accumulated
  // so outer rings never sit inside inner ones.
  const ringRadius = new Map<number, number>();
  let minOuter = 0;
  const sortedRings = [...byRing.keys()].sort((a, b) => a - b);
  for (const R of sortedRings) {
    if (R === 0) { ringRadius.set(R, 0); continue; }
    const arr = byRing.get(R)!;
    const chord = 2 * NODE_BODY_RADIUS + LATERAL_GAP;
    const byCount = (arr.length * chord) / (2 * Math.PI);
    const byIndex = R * RING_GAP;
    const radius = Math.max(byCount, byIndex, minOuter + RING_GAP);
    ringRadius.set(R, radius);
    minOuter = radius;
  }

  const positions = new Map<string, { x: number; y: number }>();
  for (const [R, arr] of byRing) {
    if (R === 0 && arr.length === 1) {
      positions.set(arr[0], { x: 0, y: 0 });
      continue;
    }
    const radius = ringRadius.get(R)!;
    const angleStep = (Math.PI * 2) / arr.length;
    for (let i = 0; i < arr.length; i++) {
      const angle = i * angleStep - Math.PI / 2;
      positions.set(arr[i], {
        x: round1(Math.cos(angle) * radius),
        y: round1(Math.sin(angle) * radius),
      });
    }
  }

  return applyPositions(graph, positions);
};
