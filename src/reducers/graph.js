import {emptyGraph} from "../model/Graph";
import {FETCHING_GRAPH_SUCCEEDED} from "../state/storageStatus";
import {moveTo, setProperties, setCaption} from "../model/Node";
import {idsMatch} from "../model/Id";

const graph = (state = emptyGraph(), action) => {
  switch (action.type) {
    case 'CREATE_NODE': {
      const newNodes = state.nodes.slice();
      newNodes.push({
        id: action.newNodeId,
        position: action.newNodePosition,
        radius: action.radius,
        caption: action.caption,
        color: action.color
      })
      return {nodes: newNodes, relationships: state.relationships}
    }

    case 'CREATE_NODE_AND_RELATIONSHIP': {
      const newNodes = state.nodes.slice();
      const newRelationships = state.relationships.slice();
      const newNode = {
        id: action.targetNodeId,
        position: action.targetNodePosition,
        radius: action.radius,
        caption: action.caption,
        color: action.color,
        properties: {}
      }
      newNodes.push(newNode)
      newRelationships.push({
        id: action.newRelationshipId,
        type: '_RELATED',
        properties: {},
        fromId: action.sourceNodeId,
        toId: newNode.id
      })
      return {nodes: newNodes, relationships: newRelationships}
    }

    case 'CONNECT_NODES': {
      const newRelationships = state.relationships.slice();
      newRelationships.push({
        id: action.newRelationshipId,
        type: '_RELATED',
        properties: {},
        fromId: action.sourceNodeId,
        toId: action.targetNodeId
      })
      return {nodes: state.nodes, relationships: newRelationships}
    }

    case 'SET_NODE_CAPTION': {
      return {
        nodes: state.nodes.map((node) => idsMatch(node.id, action.nodeId) ? setCaption(node, action.caption) : node),
        relationships: state.relationships
      }
    }

    case 'SET_NODE_PROPERTIES': {
      return {
        nodes: state.nodes.map((node) => idsMatch(node.id, action.nodeId) ? setProperties(node, action.keyValuePairs) : node),
        relationships: state.relationships
      }
    }

    case 'MOVE_NODE':
      return {
        nodes: state.nodes.map((node) => idsMatch(node.id, action.nodeId) ? moveTo(node, action.newPosition) : node),
        relationships: state.relationships
      }

    case FETCHING_GRAPH_SUCCEEDED:
      return action.storedGraph

    default:
      return state
  }
}

export default graph