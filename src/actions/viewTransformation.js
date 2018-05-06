export const zoom = (scale) => {
  return {
    type: 'ZOOM',
    scale
  }
}

export const pan = (oldMousePosition, newMousePosition) => {
  return {
    type: 'PAN',
    oldMousePosition,
    newMousePosition
  }
}