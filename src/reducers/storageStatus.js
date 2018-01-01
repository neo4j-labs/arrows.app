import {
  FETCHING_GRAPH, FETCHING_GRAPH_FAILED, FETCHING_GRAPH_SUCCEEDED, IDLE,
  UPDATING_GRAPH, UPDATING_GRAPH_FAILED, UPDATING_GRAPH_SUCCEEDED
} from "../state/storageStatus";

const storageStatus = (state = IDLE, action) => {
  switch (action.type) {
    case FETCHING_GRAPH:
    case FETCHING_GRAPH_FAILED:
    case UPDATING_GRAPH:
    case UPDATING_GRAPH_FAILED:
      return action.type;

    case FETCHING_GRAPH_SUCCEEDED:
    case UPDATING_GRAPH_SUCCEEDED:
      return IDLE;

    default:
      return state
  }
}

export default storageStatus