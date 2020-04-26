import snapToTargetNode from "./snapToTargetNode"
import {snapToDistancesAndAngles} from "./geometricSnapping"
import {idsMatch} from "../model/Id"
import {Guides} from "../graphics/Guides"
import {getVisualGraph} from "../selectors"

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
    const visualGraph = getVisualGraph(state)
    const graph = visualGraph.graph
    const targetSnaps = snapToTargetNode(visualGraph, sourceNodeId, mousePosition)
    if (targetSnaps.snapped) {
      dispatch(ringDraggedConnected(
        sourceNodeId,
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
          snaps.snappedPosition,
          new Guides(snaps.guidelines, mousePosition),
          mousePosition
        ))
      } else {
        dispatch(ringDraggedDisconnected(
          sourceNodeId,
          mousePosition,
          new Guides(),
          mousePosition
        ))
      }
    }
  }
}

const ringDraggedDisconnected = (sourceNodeId, position, guides, newMousePosition) => {
  return {
    type: 'RING_DRAGGED',
    sourceNodeId,
    targetNodeId: null,
    position,
    guides,
    newMousePosition
  }
}

const ringDraggedConnected = (sourceNodeId, targetNodeId, position, newMousePosition) => {
  return {
    type: 'RING_DRAGGED',
    sourceNodeId,
    targetNodeId,
    position,
    guides: new Guides(),
    newMousePosition
  }
}
