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

export const clearSelection = () => ({
  type: 'CLEAR_SELECTION',
})
