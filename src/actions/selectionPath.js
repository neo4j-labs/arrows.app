import {nodesInsidePolygon} from "../model/Graph"
import {ensureSelected} from "./selection"

export const updateSelectionPath = (position) => ({
  type: 'UPDATE_SELECTION_PATH',
  position
})

export const removeSelectionPath = () => ({
  type: 'REMOVE_SELECTION_PATH'
})

export const tryUpdateSelectionPath = (position, isDoubleClick) => {
  return function (dispatch, getState) {
    const {graph, gestures} = getState()

    if (isDoubleClick) {
      if (gestures.selectionPath.length === 0) {
        dispatch(updateSelectionPath(position))
      } else {
        const selectedNodeIds = nodesInsidePolygon(graph, gestures.selectionPath)
        if (selectedNodeIds.length > 0) {
          dispatch(ensureSelected(selectedNodeIds))
        }
        dispatch(removeSelectionPath())
      }
    } else if (gestures.selectionPath.length > 0) {
      dispatch(updateSelectionPath(position))
    }
  }
}