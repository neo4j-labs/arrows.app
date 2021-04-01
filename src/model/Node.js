export const moveTo = (node, newPosition) => {
  return {
    ...node,
    position: newPosition
  }
}

export const translate = (node, vector) => moveTo(node, node.position.translate(vector))

export const addLabel = (node, label) => {
  const labels = node.labels.includes(label) ? node.labels : [...node.labels, label]
  return {
    ...node,
    labels: labels
  }
}

export const renameLabel = (node, oldLabel, newLabel) => {
  const labels = [...node.labels]
  const index = labels.indexOf(oldLabel)
  if (index > -1) {
    labels[index] = newLabel
  }
  return {
    ...node,
    labels: labels
  }
}

export const removeLabel = (node, label) => {
  const labels = [...node.labels]
  const index = labels.indexOf(label)
  if (index > -1) {
    labels.splice(index, 1)
  }
  return {
    ...node,
    labels: labels
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