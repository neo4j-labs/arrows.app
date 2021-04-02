import snapToTargetNode from "./snapToTargetNode"
import {snapToDistancesAndAngles} from "./geometricSnapping"
import {idsMatch} from "../model/Id"
import {Guides} from "../graphics/Guides"
import {getVisualGraph} from "../selectors"
import {selectedNodeIds} from "../model/selection";

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
    const secondarySourceNodeIds = selectedNodeIds(selection).filter(nodeId => nodeId !== sourceNodeId)

    const visualGraph = getVisualGraph(state)
    let newNodeRadius = visualGraph.graph.style.radius
    const graph = visualGraph.graph
    const targetSnaps = snapToTargetNode(visualGraph, null, mousePosition)
    if (targetSnaps.snapped) {
      dispatch(ringDraggedConnected(
        sourceNodeId,
        secondarySourceNodeIds,
        targetSnaps.snappedNodeId,
        targetSnaps.snappedPosition,
        mousePosition
      ))
    } else {
      const snaps = snapToDistancesAndAngles(
        graph,
        [graph.nodes.find((node) => idsMatch(node.id, sourceNodeId))],
        (nodeId) => true,
        mousePosition
      )
      if (snaps.snapped) {
        dispatch(ringDraggedDisconnected(
          sourceNodeId,
          secondarySourceNodeIds,
          snaps.snappedPosition,
          new Guides(snaps.guidelines, mousePosition, newNodeRadius),
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
    targetNodeId: null,
    position,
    guides,
    newMousePosition
  }
}

const ringDraggedConnected = (sourceNodeId, secondarySourceNodeIds, targetNodeId, position, newMousePosition) => {
  return {
    type: 'RING_DRAGGED',
    sourceNodeId,
    secondarySourceNodeIds,
    targetNodeId,
    position,
    guides: new Guides(),
    newMousePosition
  }
}
