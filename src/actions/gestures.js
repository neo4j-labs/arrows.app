import snapToDistancesAndAngles from "./snapToDistancesAndAngles";
import {Guides} from "../graphics/Guides";

export const activateRing = (nodeId) => {
  return {
    type: 'ACTIVATE_RING',
    nodeId
  }
}

export const deactivateRing = () => {
  return {
    type: 'DEACTIVATE_RING'
  }
}

export const tryDragRing = (nodeId, originalPosition, position) => {
  return function (dispatch, getState) {
    let graph = getState().graph;
    let snaps = snapToDistancesAndAngles(graph, nodeId, position)
    if (snaps.snapped) {
      dispatch(ringDragged(nodeId, originalPosition, snaps.snappedPosition, new Guides(snaps.guidelines, position)))
    } else {
      dispatch(ringDragged(nodeId, originalPosition, position, new Guides()))
    }
  }
}

export const ringDragged = (nodeId, originalPosition, position, guides) => {
  return {
    type: 'RING_DRAGGED',
    nodeId,
    originalPosition,
    position,
    guides
  }
}
