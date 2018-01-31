import {
  IDLE, FETCHING_GRAPH, FETCHING_GRAPH_SUCCEEDED, FETCHING_GRAPH_FAILED,
  UPDATING_GRAPH, UPDATING_GRAPH_SUCCEEDED
} from "../state/storageStatus";
import {Graph} from "../model/Graph";
import {Node} from "../model/Node";
import {Point} from "../model/Point";
import Relationship from "../model/Relationship"

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
  return function(dispatch) {
    dispatch(fetchingGraph())

    let session = driver.session();

    return session.run('MATCH (n:Diagram0) OPTIONAL MATCH p=(n)-[]-() return n, p')
      .then((result) => {
        const nodesMap = {}
        const relationsMap = {}
        const relationships = []
        let nodes = result.records.map((record) => {
          let neo4jNode = record.get('n');
          let neo4jId = neo4jNode.identity.toString()
          const node = new Node({
            type: 'NEO4J',
            value: neo4jId
          }, new Point(toNumber(neo4jNode.properties['_x']), toNumber(neo4jNode.properties['_y'])));
          nodesMap[neo4jId] = node
          return node
        });

        result.records.forEach(record => {
          let pair = record.get('p');
          if (pair) {
            pair.segments.forEach(segment => {
              const relationship = segment.relationship
              const relId = relationship.identity.toString()
              if (!relationsMap[relId]) {
                const from = relationship.start.toString()
                const to = relationship.end.toString()
                const newRelationship = new Relationship({ id: relId, ...segment.relationship }, from, to)
                relationsMap[relId] = newRelationship
                relationships.push(newRelationship)
              }
            })
          }
        });

        dispatch(fetchingGraphSucceeded(new Graph(nodes, relationships)))
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