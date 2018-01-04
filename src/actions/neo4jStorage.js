import {
  IDLE, FETCHING_GRAPH, FETCHING_GRAPH_SUCCEEDED, FETCHING_GRAPH_FAILED,
  UPDATING_GRAPH, UPDATING_GRAPH_SUCCEEDED
} from "../state/storageStatus";
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

function updatingGraph() {
  return {
    type: UPDATING_GRAPH
  }
}

function updatingGraphSucceeded() {
  return {
    type: UPDATING_GRAPH_SUCCEEDED
  }
}

function updateGraph(graphBefore) {
  return function (dispatch, getState) {
    dispatch(updatingGraph())

    let graphAfter = getState().graph;

    for (let i = 0; i < Math.max(graphBefore.nodes.length, graphAfter.nodes.length); i++) {
      if (i >= graphBefore.nodes.length) {
        let session = driver.session();

        return session.run('CREATE (n:Diagram0 {_x: $x, _y: $y})', {
          x: graphAfter.nodes[i].position.x,
          y: graphAfter.nodes[i].position.y
        })
          .then(() => {
            dispatch(updatingGraphSucceeded())
            session.close();
          }, (error) => {
            console.log(error)
            dispatch(fetchingGraphFailed())
          })
      }
    }
  }
  }

export function fetchGraphFromDatabase() {
  return function(dispatch) {
    dispatch(fetchingGraph())

    let session = driver.session();

    return session.run('MATCH (n:Diagram0) RETURN n, id(n) as id')
      .then((result) => {
        let nodes = result.records.map((record) => {
          let neo4jNode = record.get('n');
          let neo4jId = record.get('id')
          return new Node({
            type: 'NEO4J',
            value: neo4jId
          }, new Point(neo4jNode.properties['_x'] || 0, neo4jNode.properties['_y'] || 0));
        });
        dispatch(fetchingGraphSucceeded(new Graph(nodes)))
        session.close();
      }, (error) => {
        console.log(error)
        dispatch(fetchingGraphFailed())
      })
  }
}

export function modifyGraph(graphAction) {
  return function (dispatch, getState) {
    let before = getState().graph
    dispatch(graphAction)
    if (getState().storageStatus === IDLE) {
      dispatch(updateGraph(before))
    }
  }
}