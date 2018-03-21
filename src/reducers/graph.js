import {emptyGraph} from "../model/Graph";
import {FETCHING_GRAPH_SUCCEEDED} from "../state/storageStatus";
import {moveTo, setProperties, setCaption} from "../model/Node";
import {idsMatch} from "../model/Id";
import { setType } from "../model/Relationship";

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
        type: '',
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
        nodes: state.nodes.map((node) => action.selection.selectedNodeIdMap[node.id] ? setCaption(node, action.caption) : node),
        relationships: state.relationships
      }
    }

    case 'SET_NODE_PROPERTIES': {
      return {
        nodes: state.nodes.map((node) => idsMatch(node.id, action.nodeId) ? setProperties(node, action.keyValuePairs) : node),
        relationships: state.relationships
      }
    }

    case 'MOVE_NODES':
      const nodeIdToNode = {}
      state.nodes.forEach((node) => {
        nodeIdToNode[node.id] = node
      })
      action.nodePositions.forEach((nodePosition) => {
        nodeIdToNode[nodePosition.nodeId] = moveTo(nodeIdToNode[nodePosition.nodeId], nodePosition.position)
      })
      return {
        nodes: Object.values(nodeIdToNode),
        relationships: state.relationships
      }

    case 'SET_RELATIONSHIP_TYPE' :
      return {
      nodes: state.nodes,
      relationships: state.relationships.map(relationship => action.selection.selectedRelationshipIdMap[relationship.id] ? setType(relationship, action.relationshipType) : relationship)
    }

    case 'DELETE_NODES_AND_RELATIONSHIPS' :
      return {
        nodes: state.nodes.filter(node => !action.nodeIdMap[node.id]),
        relationships: state.relationships.filter(relationship => !action.relationshipIdMap[relationship.id])
      }

    case FETCHING_GRAPH_SUCCEEDED:
      return action.storedGraph

    default:
      return state
  }
}

export default graph