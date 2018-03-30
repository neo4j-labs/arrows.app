export const combineProperties = (entities) => {
  const properties = {}
  entities.forEach((entity) => {
    Object.keys(entity.properties).forEach((key) => {
      const currentEntry = properties[key];
      if (currentEntry) {
        if (currentEntry.status === 'CONSISTENT' && currentEntry.value !== entity.properties[key]) {
          properties[key] = {status: 'INCONSISTENT'}
        }
      } else {
        properties[key] = {status: 'CONSISTENT', value: entity.properties[key]}
      }
    })
    Object.keys(properties).forEach((key) => {
      if (!entity.properties.hasOwnProperty(key)) {
        properties[key] = {status: 'PARTIAL'}
      }
    })
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