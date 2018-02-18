import {
  IDLE, FETCHING_GRAPH, FETCHING_GRAPH_SUCCEEDED, FETCHING_GRAPH_FAILED,
  UPDATING_GRAPH, UPDATING_GRAPH_FAILED, UPDATING_GRAPH_SUCCEEDED
} from "../state/storageStatus";
import {Graph} from "../model/Graph";
import Node from "../model/Node";
import {Point} from "../model/Point";
import Relationship from "../model/Relationship"
import {asKey, neo4jId} from "../model/Id";

const neo4j = require("neo4j-driver/lib/browser/neo4j-web.min.js").v1;

const host = "bolt://localhost:7687"
const driver = neo4j.driver(host, neo4j.auth.basic("neo4j", "a"))

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

function updatingGraphFailed() {
  return {
    type: UPDATING_GRAPH_FAILED
  }
}

function updatingGraphSucceeded() {
  return {
    type: UPDATING_GRAPH_SUCCEEDED
  }
}

export function updateGraph() {
  return function (dispatch, getState) {

    dispatch(updatingGraph())
    const session = driver.session(neo4j.WRITE)
    let txPromise = session.writeTransaction(() => {})

    getState().graph.nodes.forEach(node => {
      switch (node.state) {
        case 'new':
          txPromise = txPromise.then(() => session.writeTransaction((tx) => {
            tx.run('CREATE (n:Diagram0 {_x: $x, _y: $y})', {
              x: node.position.x,
              y: node.position.y
            })
          }))
          break

        case 'modified':
          txPromise = txPromise.then(() => session.writeTransaction((tx) => {
            tx.run('MATCH (n) WHERE ID(n) = $nodeId SET n._x = $x, n._y = $y', {
              nodeId: neo4j.int(node.id.value),
              x: node.position.x,
              y: node.position.y
            })
          }))
          break

        default:
          // other states don't matter
      }
    })

    txPromise.then(() => {
      session.close();
      dispatch(updatingGraphSucceeded())
    }, (error) => {
      console.log(error)
      dispatch(updatingGraphFailed())
    })
  }
}

function toNumber(prop) {
  if (prop) {
    if (prop.toNumber) {
      return prop.toNumber()
    }
    return prop
  }
  return 0
}

export function fetchGraphFromDatabase() {
  return function (dispatch) {
    dispatch(fetchingGraph())

    let session = driver.session(neo4j.READ);
    const nodes = []
    const relationships = []

    session.readTransaction((tx) => tx.run('MATCH (n:Diagram0) RETURN n'))
      .then((result) => {
        result.records.forEach((record) => {
          let neo4jNode = record.get('n');
          let neo4jNodeId = neo4jId(neo4j.integer.toString(neo4jNode.identity))
          nodes.push(new Node(
            neo4jNodeId,
            new Point(toNumber(neo4jNode.properties['_x']), toNumber(neo4jNode.properties['_y'])),
            neo4jNode.properties['_caption'], neo4jNode.properties['_color'], 'unmodified'))
        })
        return session.readTransaction((tx) => tx.run("MATCH (:Diagram0)-[r]->(:Diagram0) RETURN r"))
      })
      .then((result) => {
        result.records.forEach(record => {
          const relationship = record.get('r');
          const relId = neo4jId(neo4j.integer.toString(relationship.identity))
          const from = neo4jId(neo4j.integer.toString(relationship.start))
          const to = neo4jId(neo4j.integer.toString(relationship.end))
          const newRelationship = new Relationship({
            id: relId,
            type: relationship.type,
            properties: relationship.properties
          }, from, to)
          relationships.push(newRelationship)
        })
        session.close();
        dispatch(fetchingGraphSucceeded(new Graph(nodes, relationships)))
      }, (error) => {
        console.log(error)
        dispatch(fetchingGraphFailed())
      })
  }
}

export function modifyGraph(graphAction) {
  return function (dispatch, getState) {
    dispatch(graphAction)
    if (getState().storageStatus === IDLE) {
      dispatch(updateGraph())
    }
  }
}