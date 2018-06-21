import {fetchingGraph} from "../actions/neo4jStorage";
import {readGraph} from "./cypherReadQueries";
import {writeQueriesForAction} from "./cypherWriteQueries";
const neo4j = require("neo4j-driver/lib/browser/neo4j-web.min.js").v1;
const host = "bolt://localhost:7687"
const driver = neo4j.driver(host, neo4j.auth.basic("neo4j", "a"))

export function fetchGraphFromDatabase() {
  return function (dispatch) {
    dispatch(fetchingGraph())

    let session = driver.session(neo4j.READ)

    readGraph(session, dispatch)
  }
}

let updateQueue = []

const drainUpdateQueue = (store) => {

  const applyHead = () => {
    if (updateQueue.length > 0) {
      const action = updateQueue[0]
      const work = writeQueriesForAction(action)
      const session = driver.session()
      work(session)
        .then(() => {
          session.close()
          updateQueue.shift()
          applyHead()
        })
        .catch((error) => {
          session.close()
          console.log(error)
        })
    }
  }

  applyHead()
}

export const storageMiddleware = store => next => action => {
  if (action.category === 'GRAPH') {
    updateQueue.push(action)
    drainUpdateQueue(store)
  }
  return next(action)
}