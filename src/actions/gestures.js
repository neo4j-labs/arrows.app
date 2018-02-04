export const activateRing = (nodeId) => {
  return {
    type: 'ACTIVATE_RING',
    nodeId
  }
}

export const deactivateRing = () => {
  return {
    type: 'DEACTIVATE_RING'
  }
}

export const ringDragged = (nodeId, position) => {
  return {
    type: 'RING_DRAGGED',
    nodeId,
    position
  }
}
