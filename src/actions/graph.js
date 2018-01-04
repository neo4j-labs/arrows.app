export const createNode = () => {
  return {
    type: 'CREATE_NODE'
  }
}

export const moveNode = (nodeId, vector) => {
  return {
    type: 'MOVE_NODE',
    nodeId,
    vector
  }
}