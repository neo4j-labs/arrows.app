import { Ontology } from '../../../../libs/model/src/lib/Ontology';
import { toClassName } from '../../../arrows-app/src/linkml/naming';

export const toAnnotators = (ontologies: Ontology[]): string => {
  return ontologies.map((ontology) => `sqlite:obo:${ontology.id}`).join(', ');
};

export const toPrefixes = (ontologies: Ontology[]): Record<string, string> => {
  return ontologies.reduce(
    (prefixes: Record<string, string>, ontology) => ({
      ...prefixes,
      [toClassName(ontology.id)]: ontology.namespace,
    }),
    {}
  );
};
