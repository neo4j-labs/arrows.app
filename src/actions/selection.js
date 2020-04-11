import { getPresentGraph } from "../selectors"
import {nodeSelected, selectedNodeIds} from "../model/selection";

export const toggleSelection = (entities, mode) => ({
  type: 'TOGGLE_SELECTION',
  entities: entities.map(entity => ({
    entityType: entity.entityType,
    id: entity.id
  })),
  mode
})

export const selectAll = () => {
  return function (dispatch, getState) {
    const graph = getPresentGraph(getState())
    dispatch(toggleSelection(graph.nodes.map(node => ({...node, entityType: 'node'})), 'replace'))
  }
}

export const clearSelection = () => ({
  type: 'CLEAR_SELECTION',
})

export const jumpToNextNode = (direction, extraKeys) => {
  return function (dispatch, getState) {
    const state = getState()
    const graph = getPresentGraph(state)

    const currentSelection = getState().selection
    const nodeIds = selectedNodeIds(currentSelection)
    const currentNodeId = nodeIds[nodeIds.length - 1]

    if (currentNodeId) {
      const currentNode = graph.nodes.find(node => node.id === currentNodeId)
      const nextNode = getNextNode(currentNode, graph.nodes, direction)

      if (nextNode) {
        const multiSelect = extraKeys.shiftKey === true
        if (multiSelect) {
          if (nodeSelected(currentSelection, nextNode.id)) {
            dispatch(toggleSelection([{...currentNode, entityType: 'node'}], 'xor'))
          } else {
            dispatch(toggleSelection([{...nextNode, entityType: 'node'}], 'or'))
          }
        } else {
          dispatch(toggleSelection([{...nextNode, entityType: 'node'}], 'replace'))
        }
      }
    }
  }
}

const getNextNode = (node, nodes, direction) => {
  const angles = {
    LEFT: -Math.PI,
    UP: -Math.PI / 2,
    RIGHT: 0,
    DOWN: Math.PI / 2
  }
  const idealAngle = angles[direction]
  return nodes
    .filter(candidateNode => candidateNode.id !== node.id)
    .map(candidateNode => ({
      node: candidateNode,
      vector: candidateNode.position.vectorFrom(node.position),
    }))
    .filter(candidate => {
      const angle = candidate.vector.angle()
      return (angle > idealAngle - Math.PI / 4 && angle < idealAngle + Math.PI / 4) ||
        (angle > idealAngle + Math.PI * 7 / 4 && angle < idealAngle + Math.PI * 9 / 4)
    })
    .sort((a, b) => a.vector.distance() - b.vector.distance())
    .map(candidate => candidate.node)[0]
}