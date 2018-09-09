import {
  FETCHING_GRAPH, FETCHING_GRAPH_FAILED, FETCHING_GRAPH_SUCCEEDED, IDLE,
  UPDATING_GRAPH, UPDATING_GRAPH_FAILED, UPDATING_GRAPH_SUCCEEDED
} from "../state/storageStatus";

const initialState = {
  status: IDLE,
  store: 'neo4j',
  fileId: null
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
    case 'SET_STORE_TYPE':
      return {
        ...state,
        store: action.store,
        fileId: action.fileId,
        fileName: action.fileName
      }
    case 'SET_FILE_METADATA':
      return {
        ...state,
        fileName: action.fileName
      }
    default:
      return state
  }
}

export default storage