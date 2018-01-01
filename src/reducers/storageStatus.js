export const IDLE = 'IDLE'
export const FETCHING_GRAPH = 'FETCHING_GRAPH'
export const FETCHING_GRAPH_FAILED = 'FETCHING_GRAPH_FAILED'
export const FETCHING_GRAPH_SUCCEEDED = 'FETCHING_GRAPH_SUCCEEDED'

const storageStatus = (state = IDLE, action) => {
  switch (action.type) {
    case FETCHING_GRAPH:
      return FETCHING_GRAPH;

    case FETCHING_GRAPH_FAILED:
      return FETCHING_GRAPH_FAILED;

    case FETCHING_GRAPH_SUCCEEDED:
      return IDLE;

    default:
      return state
  }
}

export default storageStatus