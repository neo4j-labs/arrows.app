import { fetchingGraph } from "../actions/neo4jStorage";
import { readGraph } from "./cypherReadQueries";
import { writeQueriesForAction } from "./cypherWriteQueries";

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
  const work = writeQueriesForAction(action, state)

  if (driver) {
    const session = driver.session()
    return work(session)
      .then(() => {
        session.close()
      })
      .catch((error) => {
        session.close()
        console.log(error)
      })
  }
}