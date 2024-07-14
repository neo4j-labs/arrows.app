import { OntologiesJson } from './lib/types';
import { Ontology } from '@neo4j-arrows/model';

const ONTOLOGIES_LIST = 'https://www.ebi.ac.uk/ols4/api/ontologies';

export const ontologies = async (): Promise<Ontology[]> => {
  return fetch(ONTOLOGIES_LIST).then((response) =>
    response.json().then((data: OntologiesJson) =>
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
};
