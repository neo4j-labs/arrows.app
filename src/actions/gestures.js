import snapToDistancesAndAngles from "./snapToDistancesAndAngles";
import { placeGuides, clearGuides } from "./guides";

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
      dispatch(ringDragged(nodeId, originalPosition, snaps.snappedPosition))
      dispatch(placeGuides(snaps.guidelines, position))
    } else {
      dispatch(ringDragged(nodeId, originalPosition, position))
      dispatch(clearGuides())
    }
  }
}

export const ringDragged = (nodeId, originalPosition, position) => {
  return {
    type: 'RING_DRAGGED',
    nodeId,
    originalPosition,
    position
  }
}
