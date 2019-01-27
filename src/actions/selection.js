import { Vector } from "../model/Vector"

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

export const ensureDeselected = (deselectedNodeIds) => ({
  type: 'ENSURE_DESELECTED',
  deselectedNodeIds
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

export const jumpToNextNode = (direction, extraKeys) => {
  return function (dispatch, getState) {
    const { viewTransformation, applicationLayout, graph } = getState()
    const maxDimension = Math.max(applicationLayout.windowSize.width, applicationLayout.windowSize.height) / viewTransformation.scale

    const currentSelection = getState().selection
    const nodeIds = Object.keys(currentSelection.selectedNodeIdMap)
    const currentNodeId = nodeIds[nodeIds.length - 1]

    if (currentNodeId) {
      const currentNode = graph.nodes.find(node => node.id === currentNodeId)
      const nextNode = getNextNode(currentNode, graph.nodes, direction, maxDimension)

      if (nextNode) {
        const multiSelect = extraKeys.shiftKey === true
        if (multiSelect) {
          if (currentSelection.selectedNodeIdMap[nextNode.id]) {
            dispatch(toggleSelection({...currentNode, entityType: 'node'}, true))
          } else {
            dispatch(ensureSelected([nextNode.id]))
          }
        } else {
          dispatch(clearSelection())
          dispatch(ensureSelected([nextNode.id]))
        }
      }
    }
  }
}

const getNextNode = (node, nodes, direction, maxDimension) => {
  let nextNode
  const position = node.position

  const isPointBetween = (center, point1, point2, candidate) => {
    const sign1 = (candidate.x - center.x) * (point1.y - center.y) - (candidate.y - center.y) * (point1.x - center.x)
    const sign2 = (candidate.x - center.x) * (point2.y - center.y) - (candidate.y - center.y) * (point2.x - center.x)
    return sign1 > 0 && sign2 < 0 || sign1 < 0 && sign2 > 0 || (sign1 * sign2 === 0)
  }

  const getCandidates = direction => {
    switch (direction) {
      case 'LEFT': {
        const topVector = new Vector(-1, -1)
        const bottomVector = new Vector(-1, 1)

        const topPoint = node.position.translate(topVector.scale(maxDimension))
        const bottomPoint = node.position.translate(bottomVector.scale(maxDimension))

        return nodes.filter(candidate =>
          candidate.position.x < node.position.x && isPointBetween(node.position, topPoint, bottomPoint, candidate.position)
        )
      }
      case 'UP': {
        const leftVector = new Vector(-1, -1)
        const rightVector = new Vector(1, -1)

        const leftPoint = node.position.translate(leftVector.scale(maxDimension))
        const rightPoint = node.position.translate(rightVector.scale(maxDimension))

        return nodes.filter(candidate =>
          candidate.position.y < node.position.y && isPointBetween(node.position, leftPoint, rightPoint, candidate.position)
        )
      }
      case 'RIGHT': {
        const topVector = new Vector(1, -1)
        const bottomVector = new Vector(1, 1)

        const topPoint = node.position.translate(topVector.scale(maxDimension))
        const bottomPoint = node.position.translate(bottomVector.scale(maxDimension))

        return nodes.filter(candidate => {
          return candidate.position.x > node.position.x && isPointBetween(node.position, topPoint, bottomPoint, candidate.position)
        })
      }
      case 'DOWN': {
        const leftVector = new Vector(-1, 1)
        const rightVector = new Vector(1, 1)

        const leftPoint = node.position.translate(leftVector.scale(maxDimension))
        const rightPoint = node.position.translate(rightVector.scale(maxDimension))

        return nodes.filter(candidate =>
          candidate.position.y > node.position.y && isPointBetween(node.position, leftPoint, rightPoint, candidate.position)
        )
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