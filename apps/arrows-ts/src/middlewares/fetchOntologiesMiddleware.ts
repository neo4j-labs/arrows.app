import {
  loadOntologiesFailure,
  loadOntologiesSuccess,
} from '../actions/ontologies';
import { Action, Dispatch } from 'redux';
import { ontologies, ontologiesCount } from '@neo4j-arrows/ontology-search';

export const fetchOntologiesMiddleware =
  (store) => (next: Dispatch) => (action: Action) => {
    const result = next(action);

    if (action.type === 'GETTING_GRAPH') {
      ontologiesCount().then((count) => {
        ontologies(count)
          .then((ontologies) =>
            store.dispatch(loadOntologiesSuccess(ontologies))
          )
          .catch((error) => {
            store.dispatch(loadOntologiesFailure());
          });
      });
    }

    return result;
  };
