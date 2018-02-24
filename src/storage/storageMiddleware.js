import {updatingGraph, updatingGraphFailed, updatingGraphSucceeded} from "../actions/neo4jStorage";

const neo4j = require("neo4j-driver/lib/browser/neo4j-web.min.js").v1;
const host = "bolt://localhost:7687"
const driver = neo4j.driver(host, neo4j.auth.basic("neo4j", "a"))

export const storageMiddleware = store => next => action => {
  const runCypher = (cypher, parameters) => {
    store.dispatch(updatingGraph())
    const session = driver.session()
    session
      .run(cypher, parameters)
      .then(() => {
        session.close()
        store.dispatch(updatingGraphSucceeded())
      })
      .catch((error) => {
        console.log(error)
        store.dispatch(updatingGraphFailed())
      })
  }

  switch (action.type) {
    case 'CREATE_NODE': {
      runCypher('CREATE (:Diagram0 {_id: $id, _x: $x, _y: $y, _radius: $radius, ' +
        '_caption: $caption, _color: $color})', {
        id: action.newNodeId,
        x: action.newNodePosition.x,
        y: action.newNodePosition.y,
        radius: action.radius,
        caption: action.caption,
        color: action.color
      })
      break
    }

    case 'CREATE_NODE_AND_RELATIONSHIP': {
      runCypher('MATCH (n:Diagram0 {_id: $sourceNodeId}) ' +
        'CREATE (n)-[:_RELATED {_id: $newRelationshipId}]->' +
        '(:Diagram0 {_id: $targetNodeId, _x: $x, _y: $y, _radius: $radius, ' +
        '_caption: $caption, _color: $color})', {
        sourceNodeId: action.sourceNodeId,
        newRelationshipId: action.newRelationshipId,
        targetNodeId: action.targetNodeId,
        x: action.targetNodePosition.x,
        y: action.targetNodePosition.y,
        radius: action.radius,
        caption: action.caption,
        color: action.color
      })
      break
    }

    case 'CONNECT_NODES': {
      runCypher('MATCH (source:Diagram0 {_id: $sourceNodeId}), (target:Diagram0 {_id: $targetNodeId}) ' +
        'CREATE (source)-[:_RELATED {_id: $newRelationshipId}]->(target)', {
        sourceNodeId: action.sourceNodeId,
        newRelationshipId: action.newRelationshipId,
        targetNodeId: action.targetNodeId
      })
      break
    }

    case 'UPDATE_NODE_PROPERTIES': {
      runCypher('MATCH (n:Diagram0 {_id: $id}) ' +
        'SET n += $properties', {
        id: action.nodeId,
        properties: action.properties
      })
      break
    }

    case 'MOVE_NODE': {
      runCypher('MATCH (n:Diagram0 {_id: $id}) ' +
        'SET n._x = $x, n._y = $y', {
        id: action.nodeId,
        x: action.newPosition.x,
        y: action.newPosition.y
      })
      break
    }

    default:
      // other actions do not need to be stored
  }

  return next(action)
}