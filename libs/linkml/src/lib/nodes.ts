import { Node, Relationship, RelationshipType } from '@neo4j-arrows/model';
import { LinkMLClass, Attribute, SpiresCoreClasses } from './types';
import { toAttributeName, toClassName } from './naming';
import { toAnnotators } from './ontologies';

export const nodeToClass = (
  node: Node,
  findNode: (id: string) => Node,
  findRelationshipFromNode: (node: Node) => Relationship[]
): LinkMLClass => {
  const propertiesToAttributes = (): Record<string, Attribute> => {
    return Object.entries(node.properties).reduce(
      (attributes: Record<string, Attribute>, [key, value]) => ({
        ...attributes,
        [toAttributeName(key)]: {
          description: value,
        },
      }),
      {}
    );
  };

  const nodeOntologies = node.ontologies ?? [];
  const [inheritance, ...rest] = findRelationshipFromNode(node).filter(
    (relationship) =>
      relationship.relationshipType === RelationshipType.INHERITANCE
  );

  return {
    is_a: inheritance
      ? toClassName(findNode(inheritance.toId).caption)
      : SpiresCoreClasses.NamedEntity,
    mixins: rest.map((inheritance) =>
      toClassName(findNode(inheritance.toId).caption)
    ),
    attributes: propertiesToAttributes(),
    id_prefixes: nodeOntologies.map((ontology) =>
      ontology.id.toLocaleUpperCase()
    ),
    annotations: nodeOntologies.length
      ? {
          annotators: toAnnotators(nodeOntologies),
        }
      : {},
  };
};
