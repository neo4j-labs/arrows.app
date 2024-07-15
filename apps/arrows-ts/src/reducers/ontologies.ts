import { Ontology } from '@neo4j-arrows/model';
import { OntologiesAction } from '../actions/ontologies';
import { ontologies as hardcodedOntologies } from '@neo4j-arrows/model';

export type OntologyState = {
  ontologies: Ontology[];
  isFetching: boolean;
};

const ontologies = (
  state: OntologyState = { ontologies: [], isFetching: false },
  { type, ontologies }: OntologiesAction
) => {
  switch (type) {
    case 'LOAD_ONTOLOGIES_REQUEST':
      return { ...state, isFetching: true };
    case 'LOAD_ONTOLOGIES_SUCCESS':
      return { ...state, ontologies, isFetching: false };
    case 'LOAD_ONTOLOGIES_FAILURE':
      return { ...state, hardcodedOntologies, isFetching: false };
    default:
      return state;
  }
};

export default ontologies;
