export const combineProperties = (entities) => {
  const properties = {}
  let firstKey = true;
  entities.forEach((entity) => {
    Object.keys(entity.properties).forEach((key) => {
      const currentEntry = properties[key];
      if (currentEntry) {
        if (currentEntry.status === 'CONSISTENT' && currentEntry.value !== entity.properties[key]) {
          properties[key] = {status: 'INCONSISTENT'}
        }
      } else {
        if (firstKey) {
          properties[key] = {status: 'CONSISTENT', value: entity.properties[key]}
        } else {
          properties[key] = {status: 'PARTIAL'}
        }
      }
    })
    Object.keys(properties).forEach((key) => {
      if (!entity.properties.hasOwnProperty(key)) {
        properties[key] = {status: 'PARTIAL'}
      }
    })
    firstKey = false
  })
  return properties
}

export const combineStyle = (entities) => {
  const style = {}
  let firstKey = true;
  entities.forEach((entity) => {
    if(entity.style) {
      Object.keys(entity.style).forEach((key) => {
        const currentEntry = style[key];
        if (currentEntry) {
          if (currentEntry.status === 'CONSISTENT' && currentEntry.value !== entity.style[key]) {
            style[key] = { status: 'INCONSISTENT' }
          }
        } else {
          if (firstKey) {
            style[key] = { status: 'CONSISTENT', value: entity.style[key] }
          } else {
            style[key] = { status: 'PARTIAL' }
          }
        }
      })
      Object.keys(style).forEach((key) => {
        if (!entity.style.hasOwnProperty(key)) {
          style[key] = { status: 'PARTIAL' }
        }
      })
      firstKey = false
    }
  })
  return style
}

export const propertyKeyToDatabaseKey = (propertyKey) => {
  return propertyKey === '' ? '_EMPTY_KEY' : propertyKey.replace(/_/g, '__')
}

const databaseKeyToPropertyKey = (databaseKey) => {
  return databaseKey === '_EMPTY_KEY' ? '' : databaseKey.replace(/__/g, '_')
}

export const styleKeyToDatabaseKey = (styleKey) => {
  return '_style-' + styleKey;
}

const databaseKeyToStyleyKey = (databaseKey) => {
  return databaseKey.replace(/^_style-/, '')
}

export const propertiesFromDatabaseEntity = (entity) => {
  return Object.keys(entity.properties).reduce((properties, propertyKey) => {
    if (!propertyKey.startsWith('_') || propertyKey.startsWith('__')) {
      properties[databaseKeyToPropertyKey(propertyKey)] = entity.properties[propertyKey]
    }
    return properties
  }, {})
}

export const styleFromDatabaseEntity = (entity) => {
  return Object.keys(entity.properties).reduce((style, propertyKey) => {
    if (propertyKey.startsWith('_style-')) {
      style[databaseKeyToStyleyKey(propertyKey)] = entity.properties[propertyKey]
    }
    return style
  }, {})
}

export const renameProperty = (entity, oldPropertyKey, newPropertyKey) => {
  const properties = {}
  Object.keys(entity.properties).forEach((key) => {
    if (key === oldPropertyKey) {
      properties[newPropertyKey] = entity.properties[oldPropertyKey]
    } else {
      properties[key] = entity.properties[key]
    }
  })
  return {
    ...entity,
    properties
  }
}

export const setProperties = (entity, keyValuePairs) => {
  const properties = {...entity.properties}
  keyValuePairs.forEach((keyValuePair) => {
    properties[keyValuePair.key] = keyValuePair.value
  })
  return {
    ...entity,
    properties
  }
}

export const setArrowsProperties = (entity, keyValuePairs) => {
  const newEntity = { ...entity }

  if (!newEntity.style) {
    newEntity.style = {}
  }

  keyValuePairs.forEach(keyValuePair => {
    newEntity.style[keyValuePair.key] = keyValuePair.value
    Object.defineProperty(newEntity, keyValuePair.key, {
      get: function () {
        return this.style[keyValuePair.key]
      }
    })
  })

  return newEntity
}

export const removeProperty = (entity, keyToRemove) => {
  const properties = {}
  Object.keys(entity.properties).forEach((key) => {
    if (key !== keyToRemove) {
      properties[key] = entity.properties[key]
    }
  })
  return {
    ...entity,
    properties
  }
}

export const removeArrowsProperties = (entity, keys) => {
  const newEntity = { ...entity }
  console.log('NEW ENTITY', newEntity)
  Object.keys(newEntity.style).forEach(key => {
    if (keys.includes(key)) {
      delete newEntity.style[key]
    }
  })

  return newEntity
}