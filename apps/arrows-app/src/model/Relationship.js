export const setType = (relationship, type) => {
  return {
    ...relationship,
    type,
  };
};

export const stringTypeToDatabaseType = (stringType) => {
  return stringType === '' ? '_RELATED' : stringType.replace(/_/g, '__');
};

export const databaseTypeToStringType = (databaseType) => {
  return databaseType === '_RELATED' ? '' : databaseType.replace(/__/g, '_');
};

export const reverse = (relationship) => {
  return {
    ...relationship,
    toId: relationship.fromId,
    fromId: relationship.toId,
  };
};

export const isRelationship = (entity) =>
  entity.hasOwnProperty('type') &&
  entity.hasOwnProperty('fromId') &&
  entity.hasOwnProperty('toId');

export const otherNodeId = (relationship, nodeId) => {
  if (relationship.fromId === nodeId) {
    return relationship.toId;
  }
  if (relationship.toId === nodeId) {
    return relationship.fromId;
  }
  return undefined;
};
