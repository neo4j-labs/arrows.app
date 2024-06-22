import { readGraph } from './cypherReadQueries';
import { writeQueriesForAction } from './cypherWriteQueries';
import { getPresentGraph } from '../selectors';
import { gettingGraph } from '../actions/storage';
import neo4j from 'neo4j-driver';

let driver = null;

export const updateDriver = (newDriver) => {
  if (driver) {
    driver.close();
  }
  driver = newDriver;
};

export function fetchGraphFromDatabase() {
  return function (dispatch) {
    if (driver) {
      dispatch(gettingGraph());

      let session = driver.session(neo4j.session.READ);

      readGraph(session, dispatch);
    }
  };
}

export const updateStore = (action, state) => {
  const graph = getPresentGraph(state);
  const workList = [writeQueriesForAction(action, graph)];

  const layers = state.applicationLayout.layers;

  if (layers && layers.length > 0) {
    layers.forEach((layer) => {
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
