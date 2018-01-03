export const zoom = (scale) => {
  return {
    type: 'ZOOM',
    scale
  }
}

export const pan = (offset) => {
  return {
    type: 'PAN',
    offset
  }
}