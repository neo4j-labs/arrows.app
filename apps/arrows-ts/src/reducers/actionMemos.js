export default function actionMemos(state = {}, action) {
  switch (action.type) {
    case 'DUPLICATE_NODES_AND_RELATIONSHIPS':
      return {
        ...state,
        lastDuplicateAction: action
      }

    default:
      return state
  }
}