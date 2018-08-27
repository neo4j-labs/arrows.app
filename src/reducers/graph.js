import {emptyGraph} from "../model/Graph";
import {FETCHING_GRAPH_SUCCEEDED} from "../state/storageStatus";
import {moveTo, setCaption} from "../model/Node";
import { setType } from "../model/Relationship";
import { removeProperty, renameProperty, setArrowsProperty, setProperty, removeArrowsProperty } from "../model/properties";
import {idsMatch} from "../model/Id";

const graph = (state = emptyGraph(), action) => {
  switch (action.type) {
    case 'CREATE_NODE': {
      const newNodes = state.nodes.slice();
      newNodes.push({
        id: action.newNodeId,
        position: action.newNodePosition,
        caption: action.caption,
        style: action.style,
        properties: {}
      })
      return {style: state.style, nodes: newNodes, relationships: state.relationships}
    }

    case 'CREATE_NODE_AND_RELATIONSHIP': {
      const newNodes = state.nodes.slice();
      const newRelationships = state.relationships.slice();
      const newNode = {
        id: action.targetNodeId,
        position: action.targetNodePosition,
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
      return {style: state.style, nodes: newNodes, relationships: newRelationships}
    }

    case 'CONNECT_NODES': {
      const newRelationships = state.relationships.slice();
      newRelationships.push({
        id: action.newRelationshipId,
        type: '',
        properties: {},
        fromId: action.sourceNodeId,
        toId: action.targetNodeId
      })
      return {style: state.style, nodes: state.nodes, relationships: newRelationships}
    }

    case 'SET_NODE_CAPTION': {
      return {
        style: state.style,
        nodes: state.nodes.map((node) => action.selection.selectedNodeIdMap[node.id] ? setCaption(node, action.caption) : node),
        relationships: state.relationships
      }
    }

    case 'RENAME_PROPERTY': {
      return {
        style: state.style,
        nodes: state.nodes.map((node) => action.selection.selectedNodeIdMap[node.id] ? renameProperty(node, action.oldPropertyKey, action.newPropertyKey) : node),
        relationships: state.relationships.map((relationship) => action.selection.selectedRelationshipIdMap[relationship.id] ? renameProperty(relationship, action.oldPropertyKey, action.newPropertyKey) : relationship)
      }
    }

    case 'SET_PROPERTY': {
      return {
        style: state.style,
        nodes: state.nodes.map((node) => action.selection.selectedNodeIdMap[node.id] ? setProperty(node, action.key, action.value) : node),
        relationships: state.relationships.map((relationship) => action.selection.selectedRelationshipIdMap[relationship.id] ? setProperty(relationship, action.key, action.value) : relationship)
      }
    }

    case 'SET_ARROWS_PROPERTY': {
      return {
        style: state.style,
        nodes: state.nodes.map((node) => action.selection.selectedNodeIdMap[node.id] ? setArrowsProperty(node, action.key, action.value) : node),
        relationships: state.relationships.map((relationship) => action.selection.selectedRelationshipIdMap[relationship.id] ? setArrowsProperty(relationship, action.key, action.value) : relationship)
      }
    }

    case 'REMOVE_PROPERTY': {
      return {
        style: state.style,
        nodes: state.nodes.map((node) => action.selection.selectedNodeIdMap[node.id] ? removeProperty(node, action.key) : node),
        relationships: state.relationships.map((relationship) => action.selection.selectedRelationshipIdMap[relationship.id] ? removeProperty(relationship, action.key) : relationship)
      }
    }

    case 'REMOVE_ARROWS_PROPERTY': {
      return {
        style: state.style,
        nodes: state.nodes.map((node) => action.selection.selectedNodeIdMap[node.id] ? removeArrowsProperty(node, action.key) : node),
        relationships: state.relationships.map((relationship) => action.selection.selectedRelationshipIdMap[relationship.id] ? removeArrowsProperty(relationship, action.key) : relationship)
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
        style: state.style,
        nodes: Object.values(nodeIdToNode),
        relationships: state.relationships
      }

    case 'SET_RELATIONSHIP_TYPE' :
      return {
        style: state.style,
        nodes: state.nodes,
        relationships: state.relationships.map(relationship => action.selection.selectedRelationshipIdMap[relationship.id] ? setType(relationship, action.relationshipType) : relationship)
      }

    case 'DUPLICATE_NODES_AND_RELATIONSHIPS' :
      const newNodes = state.nodes.slice();
      Object.keys(action.nodeIdMap).forEach(newNodeId => {
        const spec = action.nodeIdMap[newNodeId]
        const oldNode = state.nodes.find(n => idsMatch(n.id, spec.oldNodeId))
        const newNode = {
          id: newNodeId,
          position: spec.position,
          caption: oldNode.caption,
          style: {...oldNode.style},
          properties: {...oldNode.properties}
        }
        newNodes.push(newNode)
      })

      const newRelationships = state.relationships.slice();
      Object.keys(action.relationshipIdMap).forEach(newRelationshipId => {
        const spec = action.relationshipIdMap[newRelationshipId]
        const oldRelationship = state.relationships.find(r => idsMatch(r.id, spec.oldRelationshipId))
        const newRelationship = {
          id: newRelationshipId,
          type: oldRelationship.type,
          fromId: spec.fromId,
          toId: spec.toId,
          style: {...oldRelationship.style},
          properties: {...oldRelationship.properties}
        }
        newRelationships.push(newRelationship)
      })

      return {style: state.style, nodes: newNodes, relationships: newRelationships}

    case 'DELETE_NODES_AND_RELATIONSHIPS' :
      return {
        style: state.style,
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