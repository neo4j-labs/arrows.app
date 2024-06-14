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
  { nodes, relationships, ontology }: Graph
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
      ...(ontology ? { [ontology.id]: ontology.namespace } : {}),
    },
    imports: ['ontogpt:core', 'linkml:types'],
    classes: {
      ...{ [`${toClassName(name)}Annotations`]: getAnnotations(nodes) },
      ...nodes.reduce(
        (classes: Record<string, LinkMLClass>, node) => ({
          ...classes,
          [toClassName(node.caption)]: nodeToClass(node, ontology),
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
