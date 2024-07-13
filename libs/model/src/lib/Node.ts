import { Id, Entity } from './Id';
import { Vector } from './Vector';
import { Point } from './Point';
import { Ontology } from './Ontology';

export interface Node extends Entity {
  superNodeId?: any;
  type?: any;
  initialPositions?: any;
  position: Point;
  caption: string;
  status?: string;
  ontologies?: Ontology[];
  examples?: string;
}

export const moveTo = (node: Node, newPosition: Point) => {
  return {
    ...node,
    position: newPosition,
  };
};

export const translate = (node: Node, vector: Vector) =>
  moveTo(node, node.position.translate(vector));

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
