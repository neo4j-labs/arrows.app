import { Relationship } from '../../../../libs/model/src/lib/Relationship';
import { toAnnotators } from '../../../arrows-ts/src/model/ontologies';
import { Node } from '../../../../libs/model/src/lib/Node';
import { LinkMLClass, SpiresCoreClasses } from './types';
import { toClassName } from './naming';

export const relationshipToRelationshipClass = (
  relationship: Relationship,
  nodeIdToNode: (id: string) => Node,
  toRelationshipClassName: (relationship: Relationship) => string
): LinkMLClass => {
  return {
    is_a: SpiresCoreClasses.Triple,
    description: `A triple where the subject is a ${
      nodeIdToNode(relationship.fromId).caption
    } and the object is a ${nodeIdToNode(relationship.toId).caption}.`,
    slot_usage: {
      subject: {
        range: toClassName(nodeIdToNode(relationship.fromId).caption),
      },
      object: {
        range: toClassName(nodeIdToNode(relationship.toId).caption),
      },
      predicate: {
        range: `${toRelationshipClassName(relationship)}Predicate`,
      },
    },
  };
};

export const relationshipToPredicateClass = (
  relationship: Relationship,
  findNode: (id: string) => Node
): LinkMLClass => {
  return {
    is_a: SpiresCoreClasses.NamedEntity,
    description: `The predicate for the ${
      findNode(relationship.fromId).caption
    } to ${findNode(relationship.toId).caption} relationships.`,
    id_prefixes: relationship.ontologies.map((ontology) => ontology.id),
    annotations: relationship.ontologies.length
      ? {
          annotators: toAnnotators(relationship.ontologies),
        }
      : {},
  };
};
