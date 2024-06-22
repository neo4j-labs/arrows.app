// ABK moved into `graphics` to break a circular depedency

import { createSelector } from 'reselect';
import memoize from 'memoizee';
import { VisualNode } from '../VisualNode';
import { ResolvedRelationship } from '../ResolvedRelationship';
import { VisualGraph } from '../VisualGraph';
import { TransformationHandles } from '../TransformationHandles';
import { bundle } from '../graph/relationshipBundling';
import { RoutedRelationshipBundle } from '../RoutedRelationshipBundle';
import { CanvasAdaptor } from './CanvasAdaptor';
import {
  Node,
  Graph,
  nodeEditing,
  nodeSelected,
  relationshipSelected,
  selectedNodeIds,
  EntitySelection,
  Point,
} from '@neo4j-arrows/model';
import { computeRelationshipAttachments } from '../relationshipAttachment';
import { BackgroundImage } from '../BackgroundImage';
import { ImageInfo } from './ImageCache';

const getSelection = (state: { selection: any }) => state.selection;
const getMouse = (state: { mouse: any }) => state.mouse;
const getViewTransformation = (state: { viewTransformation: any }) =>
  state.viewTransformation;
const getCachedImages = (state: { cachedImages: Record<string, ImageInfo> }) =>
  state.cachedImages;

export const getPresentGraph = (state: { graph: any }) =>
  state.graph.present || state.graph;

export const getGraph = (state: any) => {
  const { layers } = state.applicationLayout || {};

  if (layers && layers.length > 0) {
    return layers.reduce((resultState: any, layer: any) => {
      if (layer.selector) {
        return layer.selector({
          graph: resultState,
          [layer.name]: state[layer.name],
        });
      } else {
        return resultState;
      }
    }, getPresentGraph(state));
  } else {
    return getPresentGraph(state);
  }
};

export const measureTextContext = (() => {
  const canvas = window.document.createElement('canvas');
  return new CanvasAdaptor(canvas.getContext('2d') as CanvasRenderingContext2D);
})();

export const getVisualNode = (() => {
  const factory = (
    node: Node,
    graph: Graph,
    selection: EntitySelection,
    cachedImages: Record<string, ImageInfo>
  ) => {
    return new VisualNode(
      node,
      graph,
      nodeSelected(selection, node.id),
      nodeEditing(selection, node.id),
      measureTextContext,
      cachedImages
    );
  };
  return memoize(factory, { max: 10000 });
})();

export const getVisualGraph = createSelector(
  [getGraph, getSelection, getCachedImages],
  (graph: Graph, selection, cachedImages) => {
    const visualNodes = graph.nodes.reduce((nodeMap, node) => {
      nodeMap[node.id] = getVisualNode(node, graph, selection, cachedImages);
      return nodeMap;
    }, {} as Record<string, VisualNode>);

    const relationshipAttachments = computeRelationshipAttachments(
      graph,
      visualNodes
    );

    const resolvedRelationships = graph.relationships.map(
      (relationship) =>
        new ResolvedRelationship(
          relationship,
          visualNodes[relationship.fromId],
          visualNodes[relationship.toId],
          relationshipAttachments.start[relationship.id],
          relationshipAttachments.end[relationship.id],
          relationshipSelected(selection, relationship.id),
          graph
        )
    );
    const relationshipBundles = bundle(resolvedRelationships).map((bundle) => {
      return new RoutedRelationshipBundle(
        bundle,
        graph,
        selection,
        measureTextContext,
        cachedImages
      );
    });

    // return new VisualGraph(graph, visualNodes, relationshipBundles, measureTextContext) // ABK: why `measureTextContext` here?
    return new VisualGraph(graph, visualNodes, relationshipBundles);
  }
);

export const getBackgroundImage = createSelector(
  [getGraph, getCachedImages],
  (graph, cachedImages) => {
    return new BackgroundImage(graph.style, cachedImages);
  }
);

export const getTransformationHandles = createSelector(
  [getVisualGraph, getSelection, getMouse, getViewTransformation],
  (visualGraph, selection, mouse, viewTransformation) => {
    return new TransformationHandles(
      visualGraph,
      selection,
      mouse,
      viewTransformation
    );
  }
);

export interface NodePosition {
  nodeId: string;
  position: Point;
  radius: number;
}

export const getPositionsOfSelectedNodes = createSelector(
  [getVisualGraph, getSelection],
  (visualGraph, selection) => {
    const nodePositions: NodePosition[] = [];
    selectedNodeIds(selection).forEach((nodeId) => {
      const visualNode = visualGraph.nodes[nodeId];
      nodePositions.push({
        nodeId: visualNode.id,
        position: visualNode.position,
        radius: visualNode.radius,
      });
    });
    return nodePositions;
  }
);
