const entitySelection = (entityType) => {
  switch (entityType) {
    case 'node':
      return 'selectedNodeIdMap'
    case 'relationship':
      return 'selectedRelationshipIdMap'
  }
}

const allEntitiesSelected = (state, entities) => {
  return entities.every(entity => state[entitySelection(entity.entityType)][entity.id])
}

export default function selection(state = {
  selectedNodeIdMap: {},
  selectedRelationshipIdMap: {}
}, action) {
  switch (action.type) {
    case 'TOGGLE_SELECTION':
      if (action.mode === 'at-least' && allEntitiesSelected(state, action.entities)) {
        return state
      }

      const newState = {...state}
      switch (action.mode) {
        case 'xor':
          newState.selectedNodeIdMap = {...state.selectedNodeIdMap}
          newState.selectedRelationshipIdMap = {...state.selectedRelationshipIdMap}
          action.entities.forEach(entity => {
            const newSelection = newState[entitySelection(entity.entityType)]
            if (newSelection[entity.id]) {
              delete newSelection[entity.id]
            } else {
              newSelection[entity.id] = true
            }
          })
          break

        case 'or':
          newState.selectedNodeIdMap = {...state.selectedNodeIdMap}
          newState.selectedRelationshipIdMap = {...state.selectedRelationshipIdMap}
          action.entities.forEach(entity => {
            const newSelection = newState[entitySelection(entity.entityType)]
            newSelection[entity.id] = true
          })
          break

        case 'replace':
        case 'at-least':
          newState.selectedNodeIdMap = {}
          newState.selectedRelationshipIdMap = {}
          action.entities.forEach(entity => {
            const newSelection = newState[entitySelection(entity.entityType)]
            newSelection[entity.id] = true
          })
          break
      }
      return newState

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedNodeIdMap: {},
        selectedRelationshipIdMap: {}
      }
    case 'CREATE_NODE': {
      const oneNodeSelected = {}
      oneNodeSelected[action.newNodeId] = true
      return {
        ...state,
        selectedNodeIdMap: oneNodeSelected,
        selectedRelationshipIdMap: {}
      }
    }
    case 'CREATE_NODE_AND_RELATIONSHIP': {
      const oneNodeSelected = {}
      oneNodeSelected[action.targetNodeId] = true
      return {
        ...state,
        selectedNodeIdMap: oneNodeSelected,
        selectedRelationshipIdMap: {}
      }
    }
    case 'CONNECT_NODES': {
      const oneRelationshipSelected = {}
      oneRelationshipSelected[action.newRelationshipId] = true
      return {
        ...state,
        selectedNodeIdMap: {},
        selectedRelationshipIdMap: oneRelationshipSelected
      }
    }
    case 'DUPLICATE_NODES_AND_RELATIONSHIPS' :
      return {
        ...state,
        selectedNodeIdMap: Object.keys(action.nodeIdMap).reduce((newMap, nodeId) => {
          newMap[nodeId] = true
          return newMap
        }, {}),
        selectedRelationshipIdMap: Object.keys(action.relationshipIdMap).reduce((newMap, relId) => {
          newMap[relId] = true
          return newMap
        }, {})
      }
    case 'DELETE_NODES_AND_RELATIONSHIPS' :
      return {
        ...state,
        selectedNodeIdMap: Object.keys(state.selectedNodeIdMap).reduce((newMap, nodeId) => {
          if (!action.nodeIdMap[nodeId]) {
            newMap[nodeId] = true
          }
          return newMap
        }, {}),
        selectedRelationshipIdMap: Object.keys(state.selectedRelationshipIdMap).reduce((newMap, relId) => {
          if (!action.relationshipIdMap[relId]) {
            newMap[relId] = true
          }
          return newMap
        }, {})
      }
    default:
      return state
  }
}