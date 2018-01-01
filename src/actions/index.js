export const createNode = () => {
  return {
    type: 'CREATE_NODE'
  }
}

export const windowResized = (width, height) => {
  return {
    type: 'WINDOW_RESIZED',
    width,
    height
  }
}