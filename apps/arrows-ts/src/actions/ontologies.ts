import { Ontology, ontologies } from '@neo4j-arrows/model';
import { Action } from 'redux';

export interface OntologiesAction extends Action<'LOAD_ONTOLOGIES'> {
  ontologies: Ontology[];
}

export const fetchOntologies = (): OntologiesAction => {
  return {
    type: 'LOAD_ONTOLOGIES',
    ontologies: ontologies,
  };
};
