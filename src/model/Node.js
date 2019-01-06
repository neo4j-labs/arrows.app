export const moveTo = (node, newPosition) => {
  return {
    ...node,
    position: newPosition
  }
}

export const addLabel = (node, label) => {
  const labels = new Set(node.labels)
  labels.add(label)
  return {
    ...node,
    labels: [...labels]
  }
}

export const removeLabel = (node, label) => {
  const labels = new Set(node.labels)
  labels.delete(label)
  return {
    ...node,
    labels: [...labels]
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