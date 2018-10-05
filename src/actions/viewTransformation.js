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

export const scroll = (vector) => {
  return {
    type: 'SCROLL',
    vector
  }
}

export const adjustViewport = (scale, panX, panY) => {
  return {
    type: 'ADJUST_VIEWPORT',
    scale,
    panX,
    panY
  }
}