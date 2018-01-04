export const createNode = () => {
  return {
    type: 'CREATE_NODE'
  }
}

export const moveNode = (node, position) => {
  return {
    type: 'MOVE_NODE',
    node,
    position
  }
}