import { readGraph } from './cypherReadQueries';
import { writeQueriesForAction } from './cypherWriteQueries';
import { getPresentGraph } from '../selectors';
import { gettingGraph } from '../actions/storage';

import neo4j, { Driver as Neo4jDriver, SessionMode } from 'neo4j-driver';

let driver: Neo4jDriver | null = null;

export const updateDriver = (newDriver: Neo4jDriver) => {
  if (driver) {
    driver.close();
  }
  driver = newDriver;
};

export function fetchGraphFromDatabase() {
  return function (dispatch: (args: { type: string }) => void) {
    if (driver) {
      dispatch(gettingGraph());

      const session = driver.session({ defaultAccessMode: 'READ' });

      readGraph(session, dispatch);
    }
  };
}

export const updateStore = (action: any, state: any) => {
  const graph = getPresentGraph(state);
  const workList = [writeQueriesForAction(action, graph)];

  const layers = state.applicationLayout.layers;

  if (layers && layers.length > 0) {
    layers.forEach((layer: any) => {
      if (
        layer.persist &&
        layer.storageActionHandler &&
        layer.storageActionHandler['neo4j']
      ) {
        workList.push(layer.storageActionHandler['neo4j'](action));
      }
    });
  }

  if (driver) {
    const session = driver.session();

    return Promise.all(workList.map((work) => work(session)))
      .then(() => {
        session.close();
      })
      .catch((error) => {
        session.close();
        console.log(error);
      });
  }
};
