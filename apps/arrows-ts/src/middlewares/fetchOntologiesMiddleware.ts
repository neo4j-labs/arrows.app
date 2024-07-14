import {
  loadOntologiesFailure,
  loadOntologiesSuccess,
} from '../actions/ontologies';
import { Action, Dispatch } from 'redux';

type Link = {
  href: string;
};

type Page = {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
};

type Links = {
  first: Link;
  self: Link;
  next: Link;
  last: Link;
};

type OntologyConfig = {
  id: string;
  description: string;
  title: string;
  fileLocation: string;
};

type Embedded = {
  ontologies: { config: OntologyConfig }[];
};

type OntologiesJson = {
  _embedded: Embedded;
  links: Links;
  page: Page;
};

export const fetchOntologiesMiddleware =
  (store) => (next: Dispatch) => (action: Action) => {
    const result = next(action);

    if (action.type === 'GETTING_GRAPH') {
      fetch('https://www.ebi.ac.uk/ols4/api/ontologies')
        .then((response) =>
          response
            .json()
            .then((data: OntologiesJson) => {
              store.dispatch(
                loadOntologiesSuccess(
                  data._embedded.ontologies.map(
                    ({ config: { id, title, description, fileLocation } }) => {
                      return {
                        id,
                        description,
                        name: title,
                        namespace: fileLocation,
                      };
                    }
                  )
                )
              );
            })
            .catch((error) => {
              store.dispatch(loadOntologiesFailure());
            })
        )
        .catch((error) => {
          store.dispatch(loadOntologiesFailure());
        });
    }

    return result;
  };
