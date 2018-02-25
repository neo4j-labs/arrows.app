import {
  FETCHING_GRAPH, FETCHING_GRAPH_SUCCEEDED, FETCHING_GRAPH_FAILED,
  UPDATING_GRAPH, UPDATING_GRAPH_FAILED, UPDATING_GRAPH_SUCCEEDED
} from "../state/storageStatus";
import {Point} from "../model/Point";

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

export function updatingGraph() {
  return {
    type: UPDATING_GRAPH
  }
}

export function updatingGraphFailed() {
  return {
    type: UPDATING_GRAPH_FAILED
  }
}

export function updatingGraphSucceeded() {
  return {
    type: UPDATING_GRAPH_SUCCEEDED
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
          const actualProperties = Object.keys(neo4jNode.properties).reduce((properties, propertyKey) => {
            if (!propertyKey.startsWith('_')) {
              properties[propertyKey] = neo4jNode.properties[propertyKey]
            }
            return properties
          }, {})
          nodes.push({
            id: neo4jNode.properties['_id'],
            position: new Point(toNumber(neo4jNode.properties['_x']), toNumber(neo4jNode.properties['_y'])),
            radius: 50,
            caption: neo4jNode.properties['_caption'],
            color: neo4jNode.properties['_color'],
            properties: actualProperties
          })
        })
        return session.readTransaction((tx) => tx.run("MATCH (source:Diagram0)-[r]->(target:Diagram0) " +
          "RETURN source._id, target._id, r"))
      })
      .then((result) => {
        result.records.forEach(record => {
          const relationship = record.get('r');
          const relId = relationship.properties['_id']
          const from = record.get('source._id')
          const to = record.get('target._id')
          const newRelationship = {
            id: relId,
            type: relationship.type,
            properties: relationship.properties,
            fromId: from,
            toId: to
          }
          relationships.push(newRelationship)
        })
        session.close();
        dispatch(fetchingGraphSucceeded({nodes, relationships}))
      }, (error) => {
        console.log(error)
        dispatch(fetchingGraphFailed())
      })
  }
}