import { Node } from '../../../../libs/model/src/lib/Node';
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

  return {
    is_a: SpiresCoreClasses.NamedEntity,
    attributes: propertiesToAttributes(),
    id_prefixes: node.ontologies.map((ontology) => ontology.id),
    annotations: node.ontologies.length
      ? {
          annotators: toAnnotators(node.ontologies),
        }
      : {},
  };
};
