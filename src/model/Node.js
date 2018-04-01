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
