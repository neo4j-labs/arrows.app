import {
  CLEAR_SELECTION_RINGS,
  ENSURE_SELECTION_RING, REMOVE_MARQUEE, REMOVE_SELECTION_PATH, SET_MARQUEE,
  UPDATE_SELECTION_PATH
} from "../actions/gestures";

export default function selection(state = {
  selectedNodeIdMap: {},
  path: []
}, action) {
  switch (action.type) {
    case 'TOGGLE_SELECTION':
      if (action.additive) {
        const newSelectedNodeIdMap = {...state.selectedNodeIdMap}
        if (newSelectedNodeIdMap[action.id]) {
          delete newSelectedNodeIdMap[action.id]
        } else {
          newSelectedNodeIdMap[action.id] = true
        }
        return {...state, selectedNodeIdMap: newSelectedNodeIdMap}
      } else {
        if (!state.selectedNodeIdMap[action.id]) {
          const newSelectedNodeIdMap = {};
          newSelectedNodeIdMap[action.id] = true
          return {...state, selectedNodeIdMap: newSelectedNodeIdMap}
        } else {
          return state
        }
      }

    case ENSURE_SELECTION_RING:
      const selectedNodeIdMap = {...state.selectedNodeIdMap}
      action.selectedNodeIds.forEach(nodeId => selectedNodeIdMap[nodeId] = true)
      return {
        ...state,
        selectedNodeIdMap
      }
    case CLEAR_SELECTION_RINGS:
      return {
        ...state,
        selectedNodeIdMap: {}
      }
    case UPDATE_SELECTION_PATH:
      return {
        ...state,
        path: state.path.concat([action.position])
      }
    case REMOVE_SELECTION_PATH:
      return {
        ...state,
        path: []
      }
    case SET_MARQUEE:
      return {
        ...state,
        marquee: action.marquee
      }
    case REMOVE_MARQUEE:
      return {
        ...state,
        marquee: null
      }
    default:
      return state
  }
}