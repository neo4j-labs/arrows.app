import {emptyGraph} from "../model/Graph";
import {FETCHING_GRAPH_SUCCEEDED} from "../state/storageStatus";
import {moveTo, setCaption} from "../model/Node";
import { setType } from "../model/Relationship";
import { removeProperty, renameProperty, setArrowsProperties, setProperties } from "../model/properties";

const graph = (state = emptyGraph(), action) => {
  switch (action.type) {
    case 'CREATE_NODE': {
      const newNodes = state.nodes.slice();
      newNodes.push({
        id: action.newNodeId,
        position: action.newNodePosition,
        radius: action.radius,
        caption: action.caption,
        style: action.style,
        properties: {}
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
        style: action.style,
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

    case 'RENAME_PROPERTY': {
      return {
        nodes: state.nodes.map((node) => action.selection.selectedNodeIdMap[node.id] ? renameProperty(node, action.oldPropertyKey, action.newPropertyKey) : node),
        relationships: state.relationships.map((relationship) => action.selection.selectedRelationshipIdMap[relationship.id] ? renameProperty(relationship, action.oldPropertyKey, action.newPropertyKey) : relationship)
      }
    }

    case 'SET_PROPERTIES': {
      return {
        nodes: state.nodes.map((node) => action.selection.selectedNodeIdMap[node.id] ? setProperties(node, action.keyValuePairs) : node),
        relationships: state.relationships.map((relationship) => action.selection.selectedRelationshipIdMap[relationship.id] ? setProperties(relationship, action.keyValuePairs) : relationship)
      }
    }

    case 'SET_ARROWS_PROPERTIES': {
      return {
        nodes: state.nodes.map((node) => action.selection.selectedNodeIdMap[node.id] ? setArrowsProperties(node, action.keyValuePairs) : node),
        relationships: state.relationships.map((relationship) => action.selection.selectedRelationshipIdMap[relationship.id] ? setArrowsProperties(relationship, action.keyValuePairs) : relationship)
      }
    }

    case 'REMOVE_PROPERTY': {
      return {
        nodes: state.nodes.map((node) => action.selection.selectedNodeIdMap[node.id] ? removeProperty(node, action.key) : node),
        relationships: state.relationships.map((relationship) => action.selection.selectedRelationshipIdMap[relationship.id] ? removeProperty(relationship, action.key) : relationship)
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