import { Node } from '../../../../libs/model/src/lib/Node';
import { Relationship } from '../../../../libs/model/src/lib/Relationship';
import { camelCase, snakeCase, upperFirst } from 'lodash';

export const toClassName = (str: string): string => upperFirst(camelCase(str));
export const toAttributeName = (str: string): string => snakeCase(str);

export const findNodeFactory = (nodes: Node[]): ((id: string) => Node) => {
  return (id: string): Node => nodes.find((node) => node.id === id);
};

export const toRelationshipClassNameFactory = (
  nodes: Node[]
): ((relationship: Relationship) => string) => {
  const findNode = findNodeFactory(nodes);
  return (relationship: Relationship): string =>
    toRelationshipClassName(relationship, findNode);
};

const toRelationshipClassName = (
  { fromId, toId }: Relationship,
  findNode: (id: string) => Node
): string => {
  return `${toClassName(findNode(fromId).caption)}To${toClassName(
    findNode(toId).caption
  )}`;
};
