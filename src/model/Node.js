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
    id: node.id,
    position: node.position,
    radius: node.radius,
    caption: caption,
    color: node.color,
    properties: node.properties
  }
}

export const renameNodeProperty = (node, oldPropertyKey, newPropertyKey) => {
  const properties = {}
  Object.keys(node.properties).forEach((key) => {
    if (key === oldPropertyKey) {
      properties[newPropertyKey] = node.properties[oldPropertyKey]
    } else {
      properties[key] = node.properties[key]
    }
  })
  return {
    id: node.id,
    position: node.position,
    radius: node.radius,
    caption: node.caption,
    color: node.color,
    properties: properties
  }
}

export const setNodeProperties = (node, keyValuePairs) => {
  const properties = {...node.properties}
  keyValuePairs.forEach((keyValuePair) => {
    properties[keyValuePair.key] = keyValuePair.value
  })
  return {
    id: node.id,
    position: node.position,
    radius: node.radius,
    caption: node.caption,
    color: node.color,
    properties: properties
  }
}
