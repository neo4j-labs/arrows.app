import {Graph} from "../model/Graph";
import {FETCHING_GRAPH_SUCCEEDED} from "../state/storageStatus";

const graph = (state = new Graph(), action) => {
  switch (action.type) {
    case 'CREATE_NODE':
      return state.createNode();

    case 'CREATE_NODE_AND_RELATIONSHIP':
      return state.createNodeAndRelationship(action.sourceNodeId, action.targetNodePosition)

    case 'CONNECT_NODES':
      return state.connectNodes(action.sourceNodeId, action.targetNodeId)

    case 'MOVE_NODE':
      return state.moveNode(action.nodeId, action.newPosition);

    case FETCHING_GRAPH_SUCCEEDED:
      return action.storedGraph

    default:
      return state
  }
}

export default graph