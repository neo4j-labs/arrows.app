import { readGraph } from "./cypherReadQueries";
import { writeQueriesForAction } from "./cypherWriteQueries";
import { getPresentGraph } from "../selectors"
import {fetchingGraph} from "../actions/storage";

const neo4j = require("neo4j-driver/lib/browser/neo4j-web.min.js").v1;

let driver = null

export const updateDriver = (newDriver) => {
  if (driver) {
    driver.close()
  }
  driver = newDriver
}

export function fetchGraphFromDatabase() {
  return function (dispatch) {
    if (driver) {
      dispatch(fetchingGraph())

      let session = driver.session(neo4j.READ)

      readGraph(session, dispatch)
    }
  }
}

export const updateStore = (action, state) => {
  const graph = getPresentGraph(state)
  const workList = [writeQueriesForAction(action, graph)]

  const layers = state.applicationLayout.layers

  if (layers && layers.length > 0) {
    layers.forEach(layer => {
      if (layer.persist && layer.storageActionHandler && layer.storageActionHandler['neo4j']) {
        workList.push(layer.storageActionHandler['neo4j'](action))
      }
    })
  }

  if (driver) {
    const session = driver.session()

    return Promise.all(workList.map(work => work(session)))
      .then(() => {
        session.close()
      })
      .catch((error) => {
        session.close()
        console.log(error)
      })
  }
}