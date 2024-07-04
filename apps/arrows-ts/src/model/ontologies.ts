import { Ontology } from '@neo4j-arrows/model';
import { toClassName } from '../linkml/naming';

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
