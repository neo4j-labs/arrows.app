import { Ontology } from '@neo4j-arrows/model';
import { OntologiesAction } from '../actions/ontologies';

const ontologies = (state: Ontology[] = [], action: OntologiesAction) => {
  switch (action.type) {
    case 'LOAD_ONTOLOGIES':
      return action.ontologies;
    default:
      return state;
  }
};

export default ontologies;
