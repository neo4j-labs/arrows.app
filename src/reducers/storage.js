import {
  FETCHING_GRAPH, FETCHING_GRAPH_FAILED, FETCHING_GRAPH_SUCCEEDED, IDLE,
  UPDATING_GRAPH, UPDATING_GRAPH_FAILED, UPDATING_GRAPH_SUCCEEDED
} from "../state/storageStatus";

const initialState = {
  status: IDLE,
  store: 'NONE'
}

const storage = (state = initialState, action) => {
  switch (action.type) {
    case FETCHING_GRAPH:
    case FETCHING_GRAPH_FAILED:
    case UPDATING_GRAPH:
    case UPDATING_GRAPH_FAILED:
      return {
        ...state,
        status: action.type
      }
    case FETCHING_GRAPH_SUCCEEDED:
    case UPDATING_GRAPH_SUCCEEDED:
      return {
        ...state,
        status: IDLE
      }
    case 'USE_NEO4J_STORAGE':
      return {
        status: IDLE,
        store: 'NEO4J'
      }
    case 'USE_GOOGLE_DRIVE_STORAGE':
      return {
        status: IDLE,
        store: 'GOOGLE_DRIVE',
        fileId: action.fileId
      }
    default:
      return state
  }
}

export default storage