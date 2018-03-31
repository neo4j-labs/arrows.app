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

export const stringKeyToDatabaseKey = (stringKey) => {
  return stringKey === '' ? '_EMPTY_KEY' : stringKey.replace(/_/g, '__')
}

const databaseKeyToStringKey = (databaseKey) => {
  return databaseKey === '_EMPTY_KEY' ? '' : databaseKey.replace(/__/g, '_')
}

export const propertiesFromDatabaseEntity = (entity) => {
  return Object.keys(entity.properties).reduce((properties, propertyKey) => {
    if (!propertyKey.startsWith('_') || propertyKey.startsWith('__')) {
      properties[databaseKeyToStringKey(propertyKey)] = entity.properties[propertyKey]
    }
    return properties
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
