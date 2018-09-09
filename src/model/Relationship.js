export const setType = (relationship, type) => {
  return {
    id: relationship.id,
    type,
    properties: relationship.properties,
    fromId: relationship.fromId,
    toId: relationship.toId
  }
}

export const stringTypeToDatabaseType = (stringType) => {
  return stringType === '' ? '_RELATED' : stringType.replace(/_/g, '__')
}

export const databaseTypeToStringType = (databaseType) => {
  return databaseType === '_RELATED' ? '' : databaseType.replace(/__/g, '_')
}

export const reverse = relationship => {
  return {
    id: relationship.id,
    type: relationship.type,
    properties: relationship.properties,
    toId: relationship.fromId,
    fromId: relationship.toId
  }
}