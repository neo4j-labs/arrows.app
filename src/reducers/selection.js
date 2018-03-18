import {
  CLEAR_SELECTION_RINGS,
  ENSURE_SELECTION_RING, REMOVE_MARQUEE, REMOVE_SELECTION_PATH, SET_MARQUEE,
  UPDATE_SELECTION_PATH
} from "../actions/gestures";

export default function selection(state = {
  selectedNodeIdMap: {},
  selectedRelationshipIdMap: {},
  path: []
}, action) {
  switch (action.type) {
    case 'TOGGLE_SELECTION':
      const newState = {...state}
      const entitySelection = {
        'node': 'selectedNodeIdMap',
        'relationship': 'selectedRelationshipIdMap'
      }[action.entityType]

      if (entitySelection) {
        if (action.additive) {
          const newSelection = {...state[entitySelection]}
          if (newSelection[action.id]) {
            delete newSelection[action.id]
          } else {
            newSelection[action.id] = true
          }
          newState[entitySelection] = newSelection
        } else {
          if (!state[entitySelection][action.id]) {
            newState.selectedNodeIdMap = {}
            newState.selectedRelationshipIdMap = {}
            const newSelection = {};
            newSelection[action.id] = true
            newState[entitySelection] = newSelection
          }
        }
      }
      return newState

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