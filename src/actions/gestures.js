import snapToTargetNode from "./snapToTargetNode";
import {snapToDistancesAndAngles} from "./geometricSnapping";
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

export const tryDragRing = (sourceNodeId, position) => {
  return function (dispatch, getState) {
    let graph = getState().graph;
    let targetSnaps = snapToTargetNode(graph, sourceNodeId, position)
    if (targetSnaps.snapped) {
      dispatch(ringDraggedConnected(sourceNodeId, targetSnaps.snappedNodeId, targetSnaps.snappedPosition))
    } else {
      let snaps = snapToDistancesAndAngles(
        graph,
        [graph.nodes.find((node) => node.idMatches(sourceNodeId))],
        (nodeId) => true,
        position
      )
      if (snaps.snapped) {
        dispatch(ringDraggedDisconnected(sourceNodeId, snaps.snappedPosition, new Guides(snaps.guidelines, position)))
      } else {
        dispatch(ringDraggedDisconnected(sourceNodeId, position, new Guides()))
      }
    }
  }
}

const ringDraggedDisconnected = (sourceNodeId, position, guides) => {
  return {
    type: 'RING_DRAGGED',
    sourceNodeId,
    targetNodeId: null,
    position,
    guides
  }
}

const ringDraggedConnected = (sourceNodeId, targetNodeId, position) => {
  return {
    type: 'RING_DRAGGED',
    sourceNodeId,
    targetNodeId,
    position,
    guides: new Guides()
  }
}
