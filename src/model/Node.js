export const moveTo = (node, newPosition) => {
  return {
    id: node.id,
    position: newPosition,
    radius: node.radius,
    caption: node.caption,
    color: node.color,
    properties: node.properties
  }
}

export const setCaption = (node, caption) => {
  return {
    ...node,
    caption
  }
}
