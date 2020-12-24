const initialState = {
  mood: 'HAPPY',
  status: 'IDLE'
}

const storage = (state = initialState, action) => {
  switch (action.type) {
    case 'GETTING_GRAPH_SUCCEEDED':
    case 'PUTTING_GRAPH_SUCCEEDED':
      return {
        mood: 'HAPPY',
        status: 'IDLE'
      }
    case 'GETTING_GRAPH':
    case 'UPDATING_GRAPH':
      return {
        mood: 'BUSY',
        status: action.type
      }
    case 'GETTING_GRAPH_FAILED':
    case 'PUTTING_GRAPH_FAILED':
      return {
        mood: 'SAD',
        status: action.type
      }
    default:
      return state
  }
}

export default storage