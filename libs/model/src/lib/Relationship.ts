import { Entity, Id } from './Id';
import { Ontology } from './Ontology';

export interface Relationship extends Entity {
  type: string;
  fromId: Id;
  toId: Id;
  ontology?: Ontology;
}

export const setType = (relationship: Relationship, type: string) => {
  return {
    id: relationship.id,
    type,
    style: relationship.style,
    properties: relationship.properties,
    fromId: relationship.fromId,
    toId: relationship.toId,
  };
};

export const stringTypeToDatabaseType = (stringType: string) => {
  return stringType === '' ? '_RELATED' : stringType.replace(/_/g, '__');
};

export const databaseTypeToStringType = (databaseType: string) => {
  return databaseType === '_RELATED' ? '' : databaseType.replace(/__/g, '_');
};

export const reverse = (relationship: Relationship) => {
  return {
    id: relationship.id,
    type: relationship.type,
    style: relationship.style,
    properties: relationship.properties,
    toId: relationship.fromId,
    fromId: relationship.toId,
  };
};

export const isRelationship = (entity: Entity): entity is Relationship =>
  entity !== undefined &&
  typeof entity === 'object' &&
  Object.hasOwn(entity, 'type') &&
  Object.hasOwn(entity, 'fromId') &&
  Object.hasOwn(entity, 'toId');

export const otherNodeId = (relationship: Relationship, nodeId: Id) => {
  if (relationship.fromId === nodeId) {
    return relationship.toId;
  }
  if (relationship.toId === nodeId) {
    return relationship.fromId;
  }
  return undefined;
};
