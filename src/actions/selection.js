export const toggleSelection = (entity, additive) => ({
  type: 'TOGGLE_SELECTION',
  entityType: entity.entityType,
  id: entity.id,
  additive
})

export const ensureSelected = (selectedNodeIds) => ({
  type: 'ENSURE_SELECTED',
  selectedNodeIds
})

export const selectAll = () => {
  return function (dispatch, getState) {
    const graph = getState().graph
    dispatch(ensureSelected(graph.nodes.map(node => node.id)))
  }
}

export const clearSelection = () => ({
  type: 'CLEAR_SELECTION',
})

export const jumpToNextNode = direction => {
  return function (dispatch, getState) {
    const graph = getState().graph
    const currentSelection = getState().selection
    const currentNodeId = Object.keys(currentSelection.selectedNodeIdMap)[0]

    if (currentNodeId) {
      const currentNode = graph.nodes.find(node => node.id === currentNodeId)
      const nextNode = getNextNode(currentNode, graph.nodes, direction)

      if (nextNode) {
        dispatch(clearSelection())
        dispatch(ensureSelected([nextNode.id]))
      }
    }
  }
}

const getNextNode = (node, nodes, direction) => {
  let nextNode = null
  const position = node.position

  const getCandidates = direction => {
    switch (direction) {
      case 'LEFT': {
        return nodes.filter(candidate => candidate.position.x < node.position.x)
      }
      case 'UP': {
        return nodes.filter(candidate => candidate.position.y < node.position.y)
      }
      case 'RIGHT': {
        return nodes.filter(candidate => candidate.position.x > node.position.x)
      }
      case 'DOWN': {
        return nodes.filter(candidate => candidate.position.y > node.position.y)
      }
      default:
        return []
    }
  }

  const candidates = getCandidates(direction)

  nextNode = candidates.reduce((closest, candidate) => {
    if (position.vectorFrom(candidate.position).distance() < position.vectorFrom(closest.position).distance()) {
      return candidate
    } else {
      return closest
    }
  }, candidates[0])

  return nextNode
}