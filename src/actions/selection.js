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
