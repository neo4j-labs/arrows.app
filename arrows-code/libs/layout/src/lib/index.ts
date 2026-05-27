import type { LayoutFn } from './types';
import { forceDirected } from './forceDirected';
import { hierarchical } from './hierarchical';
import { radial } from './radial';
import { circular } from './circular';
import { grid } from './grid';

export type LayoutId = 'force' | 'hierarchical' | 'radial' | 'circular' | 'grid';

export interface LayoutDescriptor {
  id: LayoutId;
  label: string;
  description: string;
  run: LayoutFn;
}

// Order = order shown in the picker. Force-directed first = default on Enter.
export const LAYOUTS: readonly LayoutDescriptor[] = [
  { id: 'force',        label: 'Force-directed', description: 'Organic spring layout. Good default.',                run: forceDirected },
  { id: 'hierarchical', label: 'Hierarchical',   description: 'Top-down layers. Best for DAGs and tier shapes.',     run: hierarchical },
  { id: 'radial',       label: 'Radial',         description: 'Hub at center, rings outward. Best for hub-and-spoke.', run: radial },
  { id: 'circular',     label: 'Circular',       description: 'All nodes on one ring.',                               run: circular },
  { id: 'grid',         label: 'Grid',           description: 'Square grid, sorted by id. Visual reset.',             run: grid },
];

export function findLayout(id: LayoutId): LayoutDescriptor | undefined {
  return LAYOUTS.find((l) => l.id === id);
}

export type { LayoutFn, LayoutProgress, GraphIn, NodeIn, RelIn } from './types';
