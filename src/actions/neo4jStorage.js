import {FETCHING_GRAPH, FETCHING_GRAPH_SUCCEEDED, FETCHING_GRAPH_FAILED} from "../reducers/storageStatus";
import {Graph} from "../model/Graph";
import {Node} from "../model/Node";
import {Point} from "../model/Point";

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

function fetchingGraphSucceeded(storedGraph) {
  return {
    type: FETCHING_GRAPH_SUCCEEDED,
    storedGraph
  }
}

export function fetchGraphFromDatabase() {
  return function(dispatch) {
    dispatch(fetchingGraph())

    let session = driver.session();

    return session.run('MATCH (n:Diagram0) RETURN n')
      .then((result) => {
        console.log(result)
        let nodes = result.records.map((record) => {
          let neo4jNode = record.get('n');
          return new Node(new Point(neo4jNode.properties['_x'] || 0, neo4jNode.properties['_y'] || 0));
        });
        dispatch(fetchingGraphSucceeded(new Graph(nodes)))
        session.close();
      }, (error) => {
        console.log(error)
        dispatch(fetchingGraphFailed())
      })
  }
}