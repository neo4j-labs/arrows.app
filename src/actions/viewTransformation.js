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