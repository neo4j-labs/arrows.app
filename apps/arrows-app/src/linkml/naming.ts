import { Node } from '../../../../libs/model/src/lib/Node';
import { Relationship } from '../../../../libs/model/src/lib/Relationship';
import { camelCase, snakeCase, upperFirst } from 'lodash';

export const toClassName = (str: string): string => upperFirst(camelCase(str));
export const toAttributeName = (str: string): string => snakeCase(str);

export const nodeIdToNodeCaptionFactory = (
  nodes: Node[]
): ((id: string) => string) => {
  return (id: string): string => nodeIdToNodeCaption(id, nodes);
};

const nodeIdToNodeCaption = (id: string, nodes: Node[]): string => {
  return nodes.find((node) => node.id === id).caption;
};

export const toRelationshipClassNameFactory = (
  nodes: Node[]
): ((relationship: Relationship) => string) => {
  const idToCaption = nodeIdToNodeCaptionFactory(nodes);
  return (relationship: Relationship): string =>
    toRelationshipClassName(relationship, idToCaption);
};

const toRelationshipClassName = (
  { fromId, toId }: Relationship,
  idToCaption: (id: string) => string
): string => {
  return `${toClassName(idToCaption(fromId))}To${toClassName(
    idToCaption(toId)
  )}`;
};
