import { Id, Entity } from './Id';
import { Vector } from './Vector';
import { Point } from './Point';

export interface Node extends Entity {
  superNodeId?: any;
  type?: any;
  initialPositions?: any;
  position: Point;
  caption: string;
  labels: string[];
  status?: string;
}

export const moveTo = (node: Node, newPosition: Point) => {
  return {
    ...node,
    position: newPosition,
  };
};

export const translate = (node: Node, vector: Vector) =>
  moveTo(node, node.position.translate(vector));

export const addLabel = (node: Node, label: string) => {
  const labels = node.labels.includes(label)
    ? node.labels
    : [...node.labels, label];
  return {
    ...node,
    labels: labels,
  };
};

export const renameLabel = (node: Node, oldLabel: string, newLabel: string) => {
  const labels = [...node.labels];
  const index = labels.indexOf(oldLabel);
  if (index > -1) {
    labels[index] = newLabel;
  }
  return {
    ...node,
    labels: labels,
  };
};

export const removeLabel = (node: Node, label: string) => {
  const labels = [...node.labels];
  const index = labels.indexOf(label);
  if (index > -1) {
    labels.splice(index, 1);
  }
  return {
    ...node,
    labels: labels,
  };
};

export const setCaption = (node: Node, caption: string) => {
  return {
    ...node,
    caption,
  };
};

export const isNode = (entity: unknown): entity is Node =>
  entity !== null &&
  typeof entity === 'object' &&
  Object.hasOwn(entity, 'caption') &&
  Object.hasOwn(entity, 'position');
