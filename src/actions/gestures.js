import snapToTargetNode from "./snapToTargetNode";
import {snapToDistancesAndAngles} from "./geometricSnapping";
import {Guides} from "../graphics/Guides";
import {idsMatch} from "../model/Id";
import {nodesInsidePolygon} from "../model/Graph";

export const UPDATE_SELECTION_PATH = 'UPDATE_SELECTION_PATH'
export const REMOVE_SELECTION_PATH = 'REMOVE_SELECTION_PATH'
export const CLEAR_SELECTION = 'CLEAR_SELECTION'
export const SET_MARQUEE = 'SET_MARQUEE'
export const REMOVE_MARQUEE = 'REMOVE_MARQUEE'

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

export const tryDragRing = (sourceNodeId, mousePosition) => {
  return function (dispatch, getState) {
    let graph = getState().graph;
    let targetSnaps = snapToTargetNode(graph, sourceNodeId, mousePosition)
    if (targetSnaps.snapped) {
      dispatch(ringDraggedConnected(
        sourceNodeId,
        targetSnaps.snappedNodeId,
        targetSnaps.snappedPosition,
        mousePosition
      ))
    } else {
      let snaps = snapToDistancesAndAngles(
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

export const toggleSelection = (entity, additive) => ({
  type: 'TOGGLE_SELECTION',
  entityType: entity.entityType,
  id: entity.id,
  additive
})

export const ensureSelected = (selectedNodeIds) => ({
  type: 'ENSURE_SELECTED',
  selectedNodeIds
})

export const clearSelection = () => ({
  type: CLEAR_SELECTION,
})

export const updateSelectionPath = (position) => ({
  type: UPDATE_SELECTION_PATH,
  position
})

export const removeSelectionPath = () => ({
  type: REMOVE_SELECTION_PATH
})

export const tryUpdateSelectionPath = (position, isDoubleClick) => {
  return function (dispatch, getState) {
    const {graph, gestures} = getState()

    if (isDoubleClick) {
      if (gestures.selection.path.length === 0) {
        dispatch(updateSelectionPath(position))
      } else {
        const selectedNodeIds = nodesInsidePolygon(graph, gestures.selection.path)
        if (selectedNodeIds.length > 0) {
          dispatch(ensureSelected(selectedNodeIds))
        }
        dispatch(removeSelectionPath())
      }
    } else if (gestures.selection.path.length > 0) {
      dispatch(updateSelectionPath(position))
    }
  }
}

export const setMarquee = (from, to) => ({
  type: SET_MARQUEE,
  marquee: {from, to},
  newMousePosition: to
})

export const removeMarquee = () => ({
  type: REMOVE_MARQUEE
})

export const endMarquee = () => {
  return function (dispatch, getState) {
    const {graph, gestures} = getState()
    const marquee = gestures.selection.marquee
    console.log(marquee)
    if (marquee) {
      const bBox = getBboxFromCorners(marquee)
      const selectedNodeIds = nodesInsidePolygon(graph, bBox)
      if (selectedNodeIds.length > 0) {
        dispatch(ensureSelected(selectedNodeIds))
      }
      dispatch(removeMarquee())
    }
  }
}

const getBboxFromCorners = ({from, to}) => [
  from, {
    x: to.x,
    y: from.y
  },
  to, {
    x: from.x,
    y: to.y
  },
  from
]