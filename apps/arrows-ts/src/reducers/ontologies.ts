import { Ontology } from '@neo4j-arrows/model';
import { OntologiesAction } from '../actions/ontologies';
import { ontologies as hardcodedOntologies } from '@neo4j-arrows/model';

const ontologies = (state: Ontology[] = [], action: OntologiesAction) => {
  switch (action.type) {
    case 'LOAD_ONTOLOGIES_SUCCESS':
      return action.ontologies;
    case 'LOAD_ONTOLOGIES_FAILURE':
      return hardcodedOntologies;
    default:
      return state;
  }
};

export default ontologies;
