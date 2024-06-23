import { Graph } from '../../../../libs/model/src/lib/Graph';
import { Node } from '../../../../libs/model/src/lib/Node';
import { plural } from 'pluralize';
import { LinkMLClass, Attribute, LinkML } from './types';
import {
  nodeIdToNodeCaptionFactory,
  toAttributeName,
  toClassName,
  toRelationshipClassNameFactory,
} from './naming';
import { snakeCase } from 'lodash';
import {
  relationshipToRelationshipClass,
  relationshipToPredicateClass,
} from './relationships';
import { nodeToClass } from './nodes';

const getAnnotations = (nodes: Node[]): LinkMLClass => {
  return {
    tree_root: true,
    attributes: nodes.reduce(
      (attributes: Record<string, Attribute>, node) => ({
        ...attributes,
        [toAttributeName(plural(node.caption))]: {
          range: toClassName(node.caption),
          multivalued: true,
        },
      }),
      {}
    ),
  };
};

export const exportLinkML = (
  name: string,
  { nodes, relationships }: Graph
): LinkML => {
  const idToCaption = nodeIdToNodeCaptionFactory(nodes);
  const toRelationshipClassName = toRelationshipClassNameFactory(nodes);

  const snakeCasedName = snakeCase(name);

  return {
    id: `https://example.com/${snakeCasedName}`,
    default_range: 'string',
    name: snakeCasedName,
    title: name,
    prefixes: {
      linkml: 'https://w3id.org/linkml/',
      ontogpt: 'http://w3id.org/ontogpt/',
      ...nodes
        .filter((node) => node.ontology)
        .reduce(
          (prefixes: Record<string, string>, node) => ({
            ...prefixes,
            [toClassName(node.ontology.id)]: node.ontology.namespace,
          }),
          {}
        ),
      ...relationships
        .filter((relationship) => relationship.ontology)
        .reduce(
          (prefixes: Record<string, string>, relationship) => ({
            ...prefixes,
            [toClassName(relationship.ontology.id)]:
              relationship.ontology.namespace,
          }),
          {}
        ),
    },
    imports: ['ontogpt:core', 'linkml:types'],
    classes: {
      ...{ [`${toClassName(name)}Annotations`]: getAnnotations(nodes) },
      ...nodes.reduce(
        (classes: Record<string, LinkMLClass>, node) => ({
          ...classes,
          [toClassName(node.caption)]: nodeToClass(node),
        }),
        {}
      ),
      ...relationships.reduce(
        (classes: Record<string, LinkMLClass>, relationship) => ({
          ...classes,
          [`${toRelationshipClassName(relationship)}Relationship`]:
            relationshipToRelationshipClass(
              relationship,
              idToCaption,
              toRelationshipClassName
            ),
          [`${toRelationshipClassName(relationship)}Predicate`]:
            relationshipToPredicateClass(relationship, idToCaption),
        }),
        {}
      ),
    },
  };
};
