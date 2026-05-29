import { Point } from '../../model/Point';
import type { AppDispatch, ThunkAction } from '../store/store';
// @ts-expect-error JS modules without .d.ts.
import { getPresentGraph, getVisualGraph } from '../../selectors';
// @ts-expect-error JS module.
import { activateEditing, toggleSelection } from '../../actions/selection';
// @ts-expect-error JS module.
import { nextAvailableId } from '../../model/Id';

export type HitResult =
  | { kind: 'none' }
  | { kind: 'node'; id: string }
  | { kind: 'nodeRing'; id: string }
  | { kind: 'relationship'; id: string };

type ViewState = {
  viewTransformation: { inverse: (p: Point) => Point };
  selection?: {
    selectedNodeIdMap?: Record<string, unknown>;
    selectedRelationshipIdMap?: Record<string, unknown>;
  };
};

type GraphEntity = { id: string; entityType?: string };

export const hitTestAt =
  (canvasPosition: Point): ThunkAction<HitResult> =>
  (_dispatch, getState) => {
    const state = getState() as ViewState;
    const graphPosition = state.viewTransformation.inverse(canvasPosition);
    const item = getVisualGraph(state).entityAtPoint(graphPosition) as
      | (GraphEntity & { entityType: string })
      | null;
    if (!item) return { kind: 'none' };
    if (item.entityType === 'node') return { kind: 'node', id: item.id };
    if (item.entityType === 'nodeRing') return { kind: 'nodeRing', id: item.id };
    if (item.entityType === 'relationship') return { kind: 'relationship', id: item.id };
    return { kind: 'none' };
  };

export const selectAndPrepare =
  (hit: Exclude<HitResult, { kind: 'none' }>): ThunkAction<void> =>
  (dispatch, getState) => {
    const state = getState() as ViewState;
    const isSelected =
      hit.kind === 'node'
        ? !!state.selection?.selectedNodeIdMap?.[hit.id]
        : !!state.selection?.selectedRelationshipIdMap?.[hit.id];
    if (isSelected) return;
    (dispatch as AppDispatch)(
      toggleSelection([{ entityType: hit.kind, id: hit.id }], 'replace')
    );
  };

export const editEntity =
  (hit: Exclude<HitResult, { kind: 'none' }>): ThunkAction<void> =>
  (dispatch, getState) => {
    const state = getState();
    const graph = getPresentGraph(state) as {
      nodes: GraphEntity[];
      relationships: GraphEntity[];
    };
    const entity =
      hit.kind === 'node'
        ? graph.nodes.find((n) => n.id === hit.id)
        : graph.relationships.find((r) => r.id === hit.id);
    if (!entity) return;
    (dispatch as AppDispatch)(activateEditing({ ...entity, entityType: hit.kind }));
  };

export const createOrEditAt =
  (canvasPosition: Point): ThunkAction<void> =>
  (dispatch, getState) => {
    const state = getState() as ViewState;
    const graphPosition = state.viewTransformation.inverse(canvasPosition);
    const visualGraph = getVisualGraph(state);
    const hit = visualGraph.entityAtPoint(graphPosition);
    if (hit) {
      (dispatch as AppDispatch)(activateEditing(hit));
      return;
    }
    const graph = getPresentGraph(state) as { nodes: GraphEntity[] };
    dispatch({
      category: 'GRAPH',
      type: 'CREATE_NODE',
      newNodeId: nextAvailableId(graph.nodes),
      newNodePosition: graphPosition,
      caption: '',
      style: {},
    });
  };

