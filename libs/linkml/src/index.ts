import { Graph } from '@neo4j-arrows/model';
import { LinkMLClass, LinkML, SpiresCoreClasses } from './lib/types';
import {
  findNodeFactory,
  toClassName,
  toRelationshipClassNameFactory,
} from './lib/naming';
import { snakeCase } from 'lodash';
import {
  relationshipToRelationshipClass,
  relationshipToPredicateClass,
  findRelationshipsFromNodeFactory,
} from './lib/relationships';
import { nodeToClass } from './lib/nodes';
import { toPrefixes } from './lib/ontologies';

export const fromGraph = (
  name: string,
  { description, nodes, relationships }: Graph
): LinkML => {
  const findNode = findNodeFactory(nodes);
  const findRelationshipFromNode =
    findRelationshipsFromNodeFactory(relationships);
  const toRelationshipClassName = toRelationshipClassNameFactory(nodes);

  const snakeCasedName = snakeCase(name);

  return {
    id: `https://example.com/${snakeCasedName}`,
    default_range: 'string',
    name: snakeCasedName,
    title: name,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    prefixes: {
      linkml: 'https://w3id.org/linkml/',
      ontogpt: 'http://w3id.org/ontogpt/',
      ...toPrefixes([
        ...nodes.flatMap((node) => node.ontologies ?? []),
        ...relationships.flatMap(
          (relationship) => relationship.ontologies ?? []
        ),
      ]),
    },
    imports: ['ontogpt:core', 'linkml:types'],
    classes: {
      Document: {
        tree_root: true,
        description,
        is_a: SpiresCoreClasses.TextWithTriples,
        slot_usage: {
          triples: relationships[0]
            ? {
                range: `${toRelationshipClassName(
                  relationships[0]
                )}Relationship`,
              }
            : {},
        },
      },
      ...nodes.reduce(
        (classes: Record<string, LinkMLClass>, node) => ({
          ...classes,
          [toClassName(node.caption)]: nodeToClass(
            node,
            findNode,
            findRelationshipFromNode
          ),
        }),
        {}
      ),
      ...relationships.reduce(
        (classes: Record<string, LinkMLClass>, relationship) => ({
          ...classes,
          [`${toRelationshipClassName(relationship)}Relationship`]:
            relationshipToRelationshipClass(
              relationship,
              findNode,
              toRelationshipClassName
            ),
          [`${toRelationshipClassName(relationship)}Predicate`]:
            relationshipToPredicateClass(relationship, findNode),
        }),
        {}
      ),
    },
  };
};
