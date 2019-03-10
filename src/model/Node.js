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

export const renameLabel = (node, oldLabel, newLabel) => {
  const labels = new Set(node.labels)
  if (labels.has(oldLabel)) {
    labels.delete(oldLabel)
    labels.add(newLabel)
    return {
      ...node,
      labels: [...labels]
    }
  }
  return node
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