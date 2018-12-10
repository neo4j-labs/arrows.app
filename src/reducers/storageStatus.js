const initialState = {
  mood: 'HAPPY',
  status: 'IDLE'
}

const storage = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCHING_GRAPH_SUCCEEDED':
    case 'UPDATING_GRAPH_SUCCEEDED':
      return {
        mood: 'HAPPY',
        status: 'IDLE'
      }
    case 'FETCHING_GRAPH':
    case 'UPDATING_GRAPH':
      return {
        mood: 'BUSY',
        status: action.type
      }
    case 'FETCHING_GRAPH_FAILED':
    case 'UPDATING_GRAPH_FAILED':
      return {
        mood: 'SAD',
        status: action.type
      }
    default:
      return state
  }
}

export default storage