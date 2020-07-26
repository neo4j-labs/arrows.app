export const adjustViewport = (scale, panX, panY) => {
  return {
    type: 'ADJUST_VIEWPORT',
    scale,
    panX,
    panY
  }
}