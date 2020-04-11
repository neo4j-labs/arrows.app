const allEntitiesSelected = (state, entities) => {
  return entities.every(oldEntity =>
    state.entities.some(newEntity =>
      entitiesMatch(oldEntity, newEntity)
    )
  )
}

const entitiesMatch = (entity1, entity2) => (
  entity1.entityType === entity2.entityType &&
  entity1.id === entity2.id
)

export default function selection(state = {
  entities: []
}, action) {
  switch (action.type) {
    case 'TOGGLE_SELECTION':
      if (action.mode === 'at-least' && allEntitiesSelected(state, action.entities)) {
        return state
      }

      switch (action.mode) {
        case 'xor':
          return {
            entities: state.entities
              .filter(oldEntity => {
                return !action.entities.some(newEntity =>
                  entitiesMatch(oldEntity, newEntity)
                )
              }).concat(action.entities.filter(newEntity => {
                return !state.entities.some(oldEntity =>
                  entitiesMatch(oldEntity, newEntity)
                )
              }))
          }
        case 'or':
          return {
            entities: state.entities
              .concat(action.entities.filter(newEntity => {
                return !state.entities.some(oldEntity =>
                  entitiesMatch(oldEntity, newEntity)
                )
              }))
          }

        case 'replace':
        case 'at-least':
          return {
            entities: action.entities
          }
      }
      break

    case 'CLEAR_SELECTION':
    case 'DELETE_NODES_AND_RELATIONSHIPS' :
      return {
        entities: []
      }
    case 'CREATE_NODE': {
      return {
        entities: [{
          entityType: 'node',
          id: action.newNodeId
        }]
      }
    }
    case 'CREATE_NODE_AND_RELATIONSHIP': {
      return {
        entities: [{
          entityType: 'node',
          id: action.targetNodeId
        }]
      }
    }
    case 'CONNECT_NODES': {
      return {
        entities: [{
          entityType: 'relationship',
          id: action.newRelationshipId
        }]
      }
    }
    case 'DUPLICATE_NODES_AND_RELATIONSHIPS' :
      return {
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
    default:
      return state
  }
}