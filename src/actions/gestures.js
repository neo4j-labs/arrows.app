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