import {
  CLEAR_SELECTION_RINGS,
  ENSURE_SELECTION_RING, REMOVE_MARQUEE, REMOVE_SELECTION_PATH, SET_MARQUEE, TOGGLE_SELECTION_RING,
  UPDATE_SELECTION_PATH
} from "../actions/gestures";

export default function gestures(state = {
  dragging : {
    sourceNodeId: null,
    targetNodeId: null,
    newNodePosition: null
  },
  selection: {
    selectedNodeIdMap: {},
    path: [],
    marquee: null
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
    case 'TOGGLE_SELECTION':
      if (action.additive) {
        const newSelectedNodeIdMap = { ...state.selection.selectedNodeIdMap }
        if (newSelectedNodeIdMap[action.id]) {
          delete newSelectedNodeIdMap[action.id]
        } else {
          newSelectedNodeIdMap[action.id] = true
        }
        return {
          dragging: state.dragging,
          selection: { ...state.selection, selectedNodeIdMap: newSelectedNodeIdMap }
        }
      } else {
        if (!state.selection.selectedNodeIdMap[action.id]) {
          const newSelectedNodeIdMap = {};
          newSelectedNodeIdMap[action.id] = true
          return {
            dragging: state.dragging,
            selection: { ...state.selection, selectedNodeIdMap: newSelectedNodeIdMap }
          }
        } else {
          return state
        }
      }

    case ENSURE_SELECTION_RING:
      const selectedNodeIdMap = { ...state.selection.selectedNodeIdMap }
      action.selectedNodeIds.forEach(nodeId => selectedNodeIdMap[nodeId] = true)
      return {
        dragging: state.dragging,
        selection: { ...state.selection, selectedNodeIdMap }
      }
    case CLEAR_SELECTION_RINGS:
      return {
        dragging: state.dragging,
        selection: { ...state.selection, selectedNodeIdMap: {} }
      }
    case UPDATE_SELECTION_PATH:
      return {
        dragging: state.dragging,
        selection: { ...state.selection, path: state.selection.path.concat([action.position]) }
      }
    case REMOVE_SELECTION_PATH:
      return {
        dragging: state.dragging,
        selection: { ...state.selection, path: [] }
      }
    case SET_MARQUEE:
      return {
        dragging: state.dragging,
        selection: { ...state.selection, marquee: action.marquee }
      }
    case REMOVE_MARQUEE:
      return {
        dragging: state.dragging,
        selection: { ...state.selection, marquee: null }
      }
    default:
      return state
  }
}