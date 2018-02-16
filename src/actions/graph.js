import snapToDistancesAndAngles from "./snapToDistancesAndAngles";
import { placeGuides, clearGuides } from "./guides";

export const END_DRAG = 'END_DRAG'

export const createNode = () => {
  return {
    type: 'CREATE_NODE'
  }
}

export const tryMoveNode = (nodeId, vector) => {
  return function (dispatch, getState) {
    let graph = getState().graph;
    let currentPosition = getState().guides.naturalPosition || graph.nodes.find((node) => node.idMatches(nodeId)).position
    let naturalPosition = currentPosition.translate(vector)
    let snaps = snapToDistancesAndAngles(graph, nodeId, naturalPosition)
    if (snaps.snapped) {
      dispatch(moveNode(nodeId, snaps.snappedPosition))
      dispatch(placeGuides(snaps.guidelines, naturalPosition))
    } else {
      dispatch(moveNode(nodeId, naturalPosition))
      dispatch(clearGuides())
    }
  }
}

export const moveNode = (nodeId, newPosition) => {
  return {
    type: 'MOVE_NODE',
    nodeId,
    newPosition
  }
}

export const endDrag = () => {
  return {
    type: 'END_DRAG'
  }
}