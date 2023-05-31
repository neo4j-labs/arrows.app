import snapToTargetNode from "./snapToTargetNode"
import {snapToDistancesAndAngles} from "./geometricSnapping"
import {idsMatch} from "../model-old/Id"
import {getVisualGraph} from "../selectors"
import {selectedNodeIds} from "../model-old/selection";
import {Guides} from "../model-old/guides/guides";

export const activateRing = (sourceNodeId, nodeType) => {
  return {
    type: 'ACTIVATE_RING',
    sourceNodeId,
    nodeType
  }
}

export const deactivateRing = () => {
  return {
    type: 'DEACTIVATE_RING'
  }
}

export const tryDragRing = (sourceNodeId, mousePosition) => {
  return function (dispatch, getState) {
    const state = getState()
    const selection = state.selection
    const selected = selectedNodeIds(selection)
    const secondarySourceNodeIds = selected.includes(sourceNodeId) ? selected.filter(nodeId => nodeId !== sourceNodeId) : []

    const visualGraph = getVisualGraph(state)
    let newNodeRadius = visualGraph.graph.style.radius
    const graph = visualGraph.graph
    const sourceNode = graph.nodes.find((node) => idsMatch(node.id, sourceNodeId));
    const primarySnap = snapToTargetNode(visualGraph, null, mousePosition)
    if (primarySnap.snapped) {
      const secondarySnaps = secondarySourceNodeIds.map(secondarySourceNodeId => {
        const secondarySourceNode = graph.nodes.find((node) => idsMatch(node.id, secondarySourceNodeId));
        const displacement = secondarySourceNode.position.vectorFrom(sourceNode.position)
        return snapToTargetNode(visualGraph, null, mousePosition.translate(displacement))
      })
      const targetNodeIds = [
        primarySnap.snappedNodeId,
        ...(secondarySnaps.every(snap => snap.snapped) ?
          secondarySnaps.map(snap => snap.snappedNodeId) :
          secondarySnaps.map(() => primarySnap.snappedNodeId))
      ]
      dispatch(ringDraggedConnected(
        sourceNodeId,
        secondarySourceNodeIds,
        targetNodeIds,
        primarySnap.snappedPosition,
        mousePosition
      ))
    } else {
      const snap = snapToDistancesAndAngles(
        graph,
        [sourceNode],
        () => true,
        mousePosition
      )
      if (snap.snapped) {
        dispatch(ringDraggedDisconnected(
          sourceNodeId,
          secondarySourceNodeIds,
          snap.snappedPosition,
          new Guides(snap.guidelines, mousePosition, newNodeRadius),
          mousePosition
        ))
      } else {
        dispatch(ringDraggedDisconnected(
          sourceNodeId,
          secondarySourceNodeIds,
          mousePosition,
          new Guides(),
          mousePosition
        ))
      }
    }
  }
}

const ringDraggedDisconnected = (sourceNodeId, secondarySourceNodeIds, position, guides, newMousePosition) => {
  return {
    type: 'RING_DRAGGED',
    sourceNodeId,
    secondarySourceNodeIds,
    targetNodeIds: [],
    position,
    guides,
    newMousePosition
  }
}

const ringDraggedConnected = (sourceNodeId, secondarySourceNodeIds, targetNodeIds, position, newMousePosition) => {
  return {
    type: 'RING_DRAGGED',
    sourceNodeId,
    secondarySourceNodeIds,
    targetNodeIds,
    position,
    guides: new Guides(),
    newMousePosition
  }
}
