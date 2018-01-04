import {Graph} from "../model/Graph";
import {FETCHING_GRAPH_SUCCEEDED} from "../state/storageStatus";

const graph = (state = new Graph(), action) => {
  switch (action.type) {
    case 'CREATE_NODE':
      return state.createNode();

    case 'MOVE_NODE':
      return state.moveNode(action.node, action.position);

    case FETCHING_GRAPH_SUCCEEDED:
      return action.storedGraph

    default:
      return state
  }
}

export default graph