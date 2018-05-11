export default function selectionPath(state = [], action) {
  switch (action.type) {
    case 'UPDATE_SELECTION_PATH':
      return state.concat([action.position])
    case 'REMOVE_SELECTION_PATH':
      return []
    default:
      return state
  }
}