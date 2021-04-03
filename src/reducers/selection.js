import {ActionTypes} from "redux-undo";

const allEntitiesSelected = (oldEntities, newEntities) => {
  return newEntities.every(newEntity =>
    oldEntities.some(oldEntity =>
      entitiesMatch(oldEntity, newEntity)
    )
  )
}

const entitiesMatch = (entity1, entity2) => (
  entity1.entityType === entity2.entityType &&
  entity1.id === entity2.id
)

const toggleEntities = (oldEntities, newEntities, mode) => {
  if (mode === 'at-least' && allEntitiesSelected(oldEntities, newEntities)) {
    return oldEntities
  }

  switch (mode) {
    case 'xor':
      return oldEntities
        .filter(oldEntity => {
          return !newEntities.some(newEntity =>
            entitiesMatch(oldEntity, newEntity)
          )
        }).concat(newEntities.filter(newEntity => {
          return !oldEntities.some(oldEntity =>
            entitiesMatch(oldEntity, newEntity)
          )
        }))
    case 'or':
      return oldEntities
        .concat(newEntities.filter(newEntity => {
          return !oldEntities.some(oldEntity =>
            entitiesMatch(oldEntity, newEntity)
          )
        }))

    case 'replace':
    case 'at-least':
      return newEntities
  }
}

export default function selection(state = {
  editing: undefined,
  entities: []
}, action) {
  switch (action.type) {
    case 'ACTIVATE_EDITING':
      return {
        editing: action.editing,
        entities: toggleEntities(state.entities, [action.editing], 'at-least')
      }

    case 'DEACTIVATE_EDITING':
      return {
        editing: undefined,
        entities: state.entities
      }

    case 'TOGGLE_SELECTION':
      const entities = toggleEntities(state.entities, action.entities, action.mode)
      let editing = undefined
      if (state.editing && entities.some(selectedEntity => entitiesMatch(selectedEntity, state.editing))) {
        editing = state.editing
      }
      return {
        editing,
        entities
      }

    case 'CLEAR_SELECTION':
    case 'DELETE_NODES_AND_RELATIONSHIPS' :
    case ActionTypes.UNDO:
    case ActionTypes.REDO:
      return {
        editing: undefined,
        entities: []
      }
    case 'CREATE_NODE': {
      return {
        editing: undefined,
        entities: [{
          entityType: 'node',
          id: action.newNodeId
        }]
      }
    }
    case 'CREATE_NODES_AND_RELATIONSHIPS': {
      return {
        editing: undefined,
        entities: action.targetNodeIds.map(targetNodeId => ({
          entityType: 'node',
          id: targetNodeId
        }))
      }
    }
    case 'CONNECT_NODES': {
      return {
        editing: undefined,
        entities: action.newRelationshipIds.map(newRelationshipId => ({
          entityType: 'relationship',
          id: newRelationshipId
        }))
      }
    }
    case 'DUPLICATE_NODES_AND_RELATIONSHIPS' :
      return {
        editing: undefined,
        entities: [
          ...Object.keys(action.nodeIdMap).map(nodeId => ({
            entityType: 'node',
            id: nodeId
          })),
          ...Object.keys(action.relationshipIdMap).map(relId => ({
            entityType: 'relationship',
            id: relId
          }))
        ]
      }
    case 'MERGE_NODES':
      return {
        editing: undefined,
        entities: [
          action.mergeSpecs.map(spec => ({
            entityType: 'node',
            id: spec.survivingNodeId
          }))
        ]
      }
    case 'INLINE_RELATIONSHIPS':
      return {
        editing: undefined,
        entities: [
          action.relationshipSpecs.map(spec => ({
            entityType: 'node',
            id: spec.addPropertiesNodeId
          }))
        ]
      }
    case 'IMPORT_NODES_AND_RELATIONSHIPS':
      return {
        editing: undefined,
        entities: [
          ...action.nodes.map(node => ({
            entityType: 'node',
            id: node.id
          })),
          ...action.relationships.map(relationship => ({
            entityType: 'relationship',
            id: relationship.id
          }))
        ]
      }
    default:
      return state
  }
}