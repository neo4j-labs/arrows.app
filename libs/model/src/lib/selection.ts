import { Entity, Id } from './Id';
import { Graph } from './Graph';

export interface EntitySelection {
  editing: Entity;
  entities: Entity[];
}

export const selectedNodeIds = (selection: EntitySelection) => {
  return selection.entities
    .filter((entity) => entity.entityType === 'node')
    .map((entity) => entity.id);
};

export const selectedNodeIdMap = (selection: EntitySelection) => {
  const idMap: Record<Id, boolean> = {};
  selection.entities
    .filter((entity) => entity.entityType === 'node')
    .forEach((entity) => {
      idMap[entity.id] = true;
    });
  return idMap;
};

export const nodeSelected = (selection: EntitySelection, nodeId: Id) => {
  return selection.entities.some(
    (entity) => entity.entityType === 'node' && entity.id === nodeId
  );
};

export const nodeEditing = (selection: EntitySelection, nodeId: Id) => {
  return (
    selection.editing &&
    selection.editing.entityType === 'node' &&
    selection.editing.id === nodeId
  );
};

export const selectedNodes = (graph: Graph, selection: EntitySelection) => {
  return graph.nodes.filter((node) =>
    selection.entities.some(
      (entity) => entity.entityType === 'node' && entity.id === node.id
    )
  );
};

export const selectedRelationshipIds = (selection: EntitySelection) => {
  return selection.entities
    .filter((entity) => entity.entityType === 'relationship')
    .map((entity) => entity.id);
};

export const selectedRelationshipIdMap = (selection: EntitySelection) => {
  const idMap: Record<Id, boolean> = {};
  selection.entities
    .filter((entity) => entity.entityType === 'relationship')
    .forEach((entity) => {
      idMap[entity.id] = true;
    });
  return idMap;
};

export const relationshipSelected = (
  selection: EntitySelection,
  relationshipId: Id
) => {
  return selection.entities.some(
    (entity) =>
      entity.entityType === 'relationship' && entity.id === relationshipId
  );
};

export const relationshipEditing = (
  selection: EntitySelection,
  relationshipId: Id
) => {
  return (
    selection.editing &&
    selection.editing.entityType === 'relationship' &&
    selection.editing.id === relationshipId
  );
};

export const selectedRelationships = (
  graph: Graph,
  selection: EntitySelection
) => {
  return graph.relationships.filter((node) =>
    selection.entities.some(
      (entity) => entity.entityType === 'relationship' && entity.id === node.id
    )
  );
};
