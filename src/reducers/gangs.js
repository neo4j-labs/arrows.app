const initialState = []

export default (state = initialState, action) => {
  switch (action.type) {
    case 'CREATE_CLUSTER':
      return state.concat([{
        id: action.nodeId,
        position: action.position,
        caption: action.caption,
        style: action.style,
        properties: {},
        type: action.nodeType,
        members: action.members
      }])
    case 'REMOVE_CLUSTER':
      return state.filter(gang => gang.id !== action.nodeId)
    default:
      return state
  }
}