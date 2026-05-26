import { Point } from '../model/Point';
// @ts-expect-error JS modules without .d.ts.
import { getPresentGraph, getVisualGraph } from '../selectors';
// @ts-expect-error JS module.
import { activateEditing, toggleSelection } from '../actions/selection';
// @ts-expect-error JS module.
import { nextAvailableId } from '../model/Id';

type GetState = () => any;
type Dispatch = (action: any) => any;

export type HitResult =
  | { kind: 'none' }
  | { kind: 'node'; id: string }
  | { kind: 'nodeRing'; id: string }
  | { kind: 'relationship'; id: string };

export const hitTestAt = (canvasPosition: Point) =>
  (_dispatch: Dispatch, getState: GetState): HitResult => {
    const state = getState();
    const graphPosition = state.viewTransformation.inverse(canvasPosition);
    const item = getVisualGraph(state).entityAtPoint(graphPosition);
    if (!item) return { kind: 'none' };
    if (item.entityType === 'node') return { kind: 'node', id: item.id };
    if (item.entityType === 'nodeRing') return { kind: 'nodeRing', id: item.id };
    if (item.entityType === 'relationship') return { kind: 'relationship', id: item.id };
    return { kind: 'none' };
  };

export const selectAndPrepare = (hit: Exclude<HitResult, { kind: 'none' }>) =>
  (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    const isSelected = hit.kind === 'node'
      ? !!state.selection?.selectedNodeIdMap?.[hit.id]
      : !!state.selection?.selectedRelationshipIdMap?.[hit.id];
    if (isSelected) return;
    dispatch(toggleSelection([{ entityType: hit.kind, id: hit.id }], 'replace'));
  };

export const editEntity = (hit: Exclude<HitResult, { kind: 'none' }>) =>
  (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    const graph = getPresentGraph(state);
    const entity = hit.kind === 'node'
      ? graph.nodes.find((n: any) => n.id === hit.id)
      : graph.relationships.find((r: any) => r.id === hit.id);
    if (!entity) return;
    dispatch(activateEditing({ ...entity, entityType: hit.kind }));
  };

/** Double-click on canvas: edit a hit entity, or create a node at the click. */
export const createOrEditAt = (canvasPosition: Point) =>
  (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    const graphPosition = state.viewTransformation.inverse(canvasPosition);
    const visualGraph = getVisualGraph(state);
    const hit = visualGraph.entityAtPoint(graphPosition);
    if (hit) {
      dispatch(activateEditing(hit));
      return;
    }
    const graph = getPresentGraph(state);
    dispatch({
      category: 'GRAPH',
      type: 'CREATE_NODE',
      newNodeId: nextAvailableId(graph.nodes),
      newNodePosition: graphPosition,
      caption: '',
      style: {},
    });
  };

