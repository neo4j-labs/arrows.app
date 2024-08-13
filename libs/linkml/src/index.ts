import {
  Graph,
  RelationshipType,
  Node,
  Relationship,
  Cardinality,
  Ontology,
} from '@neo4j-arrows/model';
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

type LinkMLNode = Omit<Node, 'style' | 'position'>;
type LinkMLRelationship = Omit<Relationship, 'style'>;
type LinkMLGraph = {
  nodes: LinkMLNode[];
  relationships: LinkMLRelationship[];
};

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

export const toGraph = (
  { classes }: LinkML,
  ontologies: Ontology[]
): LinkMLGraph => {
  const nodes: LinkMLNode[] = Object.entries(classes)
    .filter(([key, value]) => value.is_a === SpiresCoreClasses.NamedEntity)
    .map(([key, { attributes, id_prefixes }], index) => {
      return {
        id: index.toString(),
        caption: key,
        properties: Object.entries(attributes ?? {}).reduce(
          (properties: Record<string, string>, [key, { description }]) => ({
            ...properties,
            [key]: description ?? '',
          }),
          {}
        ),
        entityType: 'node',
        ontologies:
          id_prefixes &&
          ontologies.filter((ontology) =>
            id_prefixes.includes(ontology.id.toLocaleUpperCase())
          ),
      };
    });
  const relationships: LinkMLRelationship[] = Object.entries(classes)
    .filter(([key, value]) => value.is_a === SpiresCoreClasses.Triple)
    .map(([key, { slot_usage }], index) => {
      if (!slot_usage) {
        return null;
      }
      const fromNode = nodes.find(
        (node) => node.caption === slot_usage['subject'].range
      );
      const toNode = nodes.find(
        (node) => node.caption === slot_usage['object'].range
      );

      if (!fromNode || !toNode) {
        return null;
      }
      return {
        relationshipType: RelationshipType.ASSOCIATION,
        fromId: fromNode.id,
        toId: toNode.id,
        properties: {},
        entityType: 'relationship',
        type: '',
        id: index.toString(),
        cardinality: Cardinality.ONE_TO_MANY,
      };
    })
    .filter(
      (relationship: LinkMLRelationship | null) => !!relationship
      // Casting as we are filtering out nulls anyway.
    ) as LinkMLRelationship[];
  return {
    nodes,
    relationships,
  };
};
