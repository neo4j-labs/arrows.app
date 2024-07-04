export enum Cardinality {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  MANY_TO_MANY = 'MANY_TO_MANY',
}

export function toVisualCardinality(cardinality: Cardinality): string {
  switch (cardinality) {
    case Cardinality.ONE_TO_ONE:
      return '1:1';
    case Cardinality.ONE_TO_MANY:
      return '1:N';
    case Cardinality.MANY_TO_MANY:
      return 'N:N';
  }
}

export const setType = (relationship, type) => {
  return {
    id: relationship.id,
    type,
    style: relationship.style,
    properties: relationship.properties,
    fromId: relationship.fromId,
    toId: relationship.toId,
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
    id: relationship.id,
    type: relationship.type,
    style: relationship.style,
    properties: relationship.properties,
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
