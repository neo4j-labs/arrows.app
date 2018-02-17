import snapToTargetNode from "./snapToTargetNode";
import snapToDistancesAndAngles from "./snapToDistancesAndAngles";
import {Guides} from "../graphics/Guides";

export const activateRing = (sourceNodeId) => {
  return {
    type: 'ACTIVATE_RING',
    sourceNodeId
  }
}

export const deactivateRing = () => {
  return {
    type: 'DEACTIVATE_RING'
  }
}

export const tryDragRing = (sourceNodeId, originalPosition, position) => {
  return function (dispatch, getState) {
    let graph = getState().graph;
    let targetSnaps = snapToTargetNode(graph, sourceNodeId, position)
    if (targetSnaps.snapped) {
      dispatch(ringDraggedConnected(sourceNodeId, targetSnaps.snappedNodeId, originalPosition, targetSnaps.snappedPosition))
    } else {
      let snaps = snapToDistancesAndAngles(graph, sourceNodeId, position)
      if (snaps.snapped) {
        dispatch(ringDraggedDisconnected(sourceNodeId, originalPosition, snaps.snappedPosition, new Guides(snaps.guidelines, position)))
      } else {
        dispatch(ringDraggedDisconnected(sourceNodeId, originalPosition, position, new Guides()))
      }
    }
  }
}

const ringDraggedDisconnected = (sourceNodeId, originalPosition, position, guides) => {
  return {
    type: 'RING_DRAGGED',
    sourceNodeId,
    targetNodeId: null,
    originalPosition,
    position,
    guides
  }
}

const ringDraggedConnected = (sourceNodeId, targetNodeId, originalPosition, position) => {
  console.log('connected', targetNodeId)
  return {
    type: 'RING_DRAGGED',
    sourceNodeId,
    targetNodeId,
    originalPosition,
    position,
    guides: new Guides()
  }
}
