import { Relationship, Node } from '@neo4j-arrows/model';
import { toAnnotators } from './ontologies';
import { Attribute, LinkMLClass, SpiresCoreClasses } from './types';
import { toClassName } from './naming';

export const findRelationshipsFromNodeFactory = (
  relationship: Relationship[]
): ((node: Node) => Relationship[]) => {
  return (node: Node): Relationship[] =>
    relationship.filter((relationship) => relationship.fromId === node.id);
};

export const relationshipToRelationshipClass = (
  relationship: Relationship,
  nodeIdToNode: (id: string) => Node,
  toRelationshipClassName: (relationship: Relationship) => string
): LinkMLClass => {
  const nodeToTripleSlot = (node: Node): Attribute => {
    return {
      range: toClassName(node.caption),
      annotations: {
        'prompt.examples': node.examples ?? '',
      },
    };
  };

  const fromNode = nodeIdToNode(relationship.fromId);
  const toNode = nodeIdToNode(relationship.toId);

  return {
    is_a: SpiresCoreClasses.Triple,
    description: `A triple where the subject is a ${fromNode.caption} and the object is a ${toNode.caption}.`,
    slot_usage: {
      subject: nodeToTripleSlot(fromNode),
      object: nodeToTripleSlot(toNode),
      predicate: {
        range: `${toRelationshipClassName(relationship)}Predicate`,
        annotations: {
          'prompt.examples': relationship.examples ?? '',
        },
      },
    },
  };
};

export const relationshipToPredicateClass = (
  relationship: Relationship,
  findNode: (id: string) => Node
): LinkMLClass => {
  const relationshipOntologies = relationship.ontologies ?? [];

  return {
    is_a: SpiresCoreClasses.RelationshipType,
    attributes: {
      label: {
        description: `The predicate for the ${
          findNode(relationship.fromId).caption
        } to ${findNode(relationship.toId).caption} relationships.`,
      },
    },
    id_prefixes: relationshipOntologies.map((ontology) =>
      ontology.id.toLocaleUpperCase()
    ),
    annotations: relationshipOntologies.length
      ? {
          annotators: toAnnotators(relationshipOntologies),
        }
      : {},
  };
};
