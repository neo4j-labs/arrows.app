import {FETCHING_GRAPH, FETCHING_GRAPH_SUCCEEDED, FETCHING_GRAPH_FAILED} from "../reducers/storageStatus";

const neo4j = require("neo4j-driver/lib/browser/neo4j-web.min.js").v1;

const host = "bolt://localhost:7687"
const driver = neo4j.driver(host, neo4j.auth.basic("neo4j", ""))

function fetchingGraph() {
  return {
    type: FETCHING_GRAPH
  }
}

function fetchingGraphFailed() {
  return {
    type: FETCHING_GRAPH_FAILED
  }
}

function fetchingGraphSucceeded() {
  return {
    type: FETCHING_GRAPH_SUCCEEDED
  }
}

export function fetchGraphFromDatabase() {
  return function(dispatch) {
    dispatch(fetchingGraph())

    let session = driver.session();

    return session.run('RETURN 1')
      .then((result) => {
        console.log(result)
        dispatch(fetchingGraphSucceeded())
      }, (error) => {
        console.log(error)
        dispatch(fetchingGraphFailed())
      })
  }
}