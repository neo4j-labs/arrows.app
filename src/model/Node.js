export const moveTo = (node, newPosition) => {
  return {
    ...node,
    position: newPosition
  }
}

export const setCaption = (node, caption) => {
  return {
    ...node,
    caption
  }
}

export const isNode = entity =>
  entity.hasOwnProperty('caption') && entity.hasOwnProperty('position')