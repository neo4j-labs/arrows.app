export default function selection(state = {
  selectedNodeIdMap: {},
  selectedRelationshipIdMap: {}
}, action) {
  switch (action.type) {
    case 'TOGGLE_SELECTION':
      const newState = {...state}
      const entitySelection = {
        'node': 'selectedNodeIdMap',
        'relationship': 'selectedRelationshipIdMap'
      }[action.entityType]

      if (entitySelection) {
        if (action.additive) {
          const newSelection = {...state[entitySelection]}
          if (newSelection[action.id]) {
            delete newSelection[action.id]
          } else {
            newSelection[action.id] = true
          }
          newState[entitySelection] = newSelection
        } else {
          if (!state[entitySelection][action.id]) {
            newState.selectedNodeIdMap = {}
            newState.selectedRelationshipIdMap = {}
            const newSelection = {};
            newSelection[action.id] = true
            newState[entitySelection] = newSelection
          }
        }
      }
      return newState

    case 'ENSURE_SELECTED':
      const selectedNodeIdMap = {...state.selectedNodeIdMap}
      action.selectedNodeIds.forEach(nodeId => selectedNodeIdMap[nodeId] = true)
      return {
        ...state,
        selectedNodeIdMap
      }
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