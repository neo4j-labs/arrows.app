import {Point} from "../model/Point";
import {databaseTypeToStringType} from "../model/Relationship";
import {propertiesFromDatabaseEntity, styleFromDatabaseEntity} from "../model/properties";
import {emptyGraph} from "../model/Graph";
import {fetchingGraphFailed, fetchingGraphSucceeded} from "../actions/neo4jStorage";

function toNumber(prop) {
  if (prop) {
    if (prop.toNumber) {
      return prop.toNumber()
    }
    return prop
  }
  return 0
}

export function readGraph(session, dispatch) {
  const nodes = []
  const relationships = []

  session.readTransaction((tx) => tx.run('MATCH (n:Diagram0) RETURN n'))
    .then((result) => {
      result.records.forEach((record) => {
        let neo4jNode = record.get('n');
        nodes.push({
          id: neo4jNode.properties['_id'],
          position: new Point(toNumber(neo4jNode.properties['_x']), toNumber(neo4jNode.properties['_y'])),
          caption: neo4jNode.properties['_caption'],
          style: styleFromDatabaseEntity(neo4jNode),
          properties: propertiesFromDatabaseEntity(neo4jNode),
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
          type: databaseTypeToStringType(relationship.type),
          properties: propertiesFromDatabaseEntity(relationship),
          style: styleFromDatabaseEntity(relationship),
          fromId: from,
          toId: to
        }
        relationships.push(newRelationship)
      })
      session.close();
      dispatch(fetchingGraphSucceeded({nodes, relationships, style: emptyGraph().style}))
    }, (error) => {
      console.log(error)
      dispatch(fetchingGraphFailed())
    })
}