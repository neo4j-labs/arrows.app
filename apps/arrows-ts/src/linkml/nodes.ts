import { Node } from '@neo4j-arrows/model';
import { LinkMLClass, Attribute, SpiresCoreClasses } from './types';
import { toAttributeName } from './naming';
import { toAnnotators } from '../../../arrows-ts/src/model/ontologies';

export const nodeToClass = (node: Node): LinkMLClass => {
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

  return {
    is_a: SpiresCoreClasses.NamedEntity,
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
