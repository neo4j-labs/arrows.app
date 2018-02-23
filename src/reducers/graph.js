import {Graph} from "../model/Graph";
import {FETCHING_GRAPH_SUCCEEDED} from "../state/storageStatus";
import { UPDATE_NODE_PROPERTIES } from "../actions/graph";

const graph = (state = new Graph(), action) => {
  const { type, ...rest } = action
  switch (type) {
    case 'CREATE_NODE':
      return state.createNode();

    case 'CREATE_NODE_AND_RELATIONSHIP':
      return state.createNodeAndRelationship(action.sourceNodeId, action.targetNodePosition)

    case 'CONNECT_NODES':
      return state.connectNodes(action.sourceNodeId, action.targetNodeId)

    case UPDATE_NODE_PROPERTIES :
      const g = state.updateNodeProperties(rest)
      return g
      
    case 'MOVE_NODE':
      return state.moveNode(action.nodeId, action.newPosition);

    case FETCHING_GRAPH_SUCCEEDED:
      return action.storedGraph

    default:
      return state
  }
}

export default graph