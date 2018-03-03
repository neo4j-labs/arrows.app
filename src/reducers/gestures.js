import { TOGGLE_SELECTION_RING } from "../actions/gestures";

export default function gestures(state = {
  dragging : {
    sourceNodeId: null,
    targetNodeId: null,
    newNodePosition: null
  },
  selection: {
    selectedNodeIdMap: {}
  }
}, action) {
  switch (action.type) {
    case 'ACTIVATE_RING':
      return {
        dragging: { sourceNodeId: action.sourceNodeId, targetNodeId: null, newNodePosition: null },
        selection: state.selection
      }
    case 'DEACTIVATE_RING':
      return {
        dragging: { sourceNodeId: null, targetNodeId: null, newNodePosition: null },
        selection: state.selection
      }
    case 'RING_DRAGGED':
      return {
        dragging: {
          sourceNodeId: action.sourceNodeId,
          targetNodeId: action.targetNodeId,
          newNodePosition: action.position
        },
        selection: state.selection
      }
    case 'END_DRAG':
      return {
        dragging: { sourceNodeId: null, targetNodeId: null, newNodePosition: null },
        selection: state.selection
      }
    case TOGGLE_SELECTION_RING:
      const newSelectedNodeIdMap = { ...state.selection.selectedNodeIdMap }
      action.selectedNodeIds.forEach(nodeId => {
        if (newSelectedNodeIdMap[nodeId]) {
          delete newSelectedNodeIdMap[nodeId]
        } else {
          newSelectedNodeIdMap[nodeId] = true
        }
      })

      return {
        dragging: state.dragging,
        selection: { ...state.selection, selectedNodeIdMap: newSelectedNodeIdMap }
      }
    default:
      return state
  }
}