import { Point } from "../model/Point";
import { databaseTypeToStringType } from "../model/Relationship";
import { propertiesFromDatabaseEntity, styleFromDatabaseEntity } from "../model/properties";
import { emptyGraph } from "../model/Graph";
import { fetchingGraphFailed, fetchingGraphSucceeded } from "../actions/neo4jStorage";
import { createCluster } from "../actions/gang"

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
  let style = emptyGraph().style

  session.readTransaction((tx) => tx.run('MATCH (n:Diagram) RETURN n'))
    .then((result) => {
      result.records.forEach((record) => {
        const neo4jNode = record.get('n')
        style = { ...style, ...(styleFromDatabaseEntity(neo4jNode)) }
      })
      return session.readTransaction((tx) => tx.run(`MATCH (n:Diagram0) RETURN n`))
    })
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
      return session.readTransaction((tx) => tx.run(`MATCH (n:Diagram0_Cluster) RETURN n`))
    }, (error) => {
      console.log(error)
      dispatch(fetchingGraphFailed())
    })
    .then((result) => {
      result.records.forEach((record) => {
        let neo4jNode = record.get('n');

        const cluster = {
          id: neo4jNode.properties['_id'],
          position: new Point(toNumber(neo4jNode.properties['_x']), toNumber(neo4jNode.properties['_y'])),
          initialPosition: new Point(toNumber(neo4jNode.properties['_xInitial']), toNumber(neo4jNode.properties['_yInitial'])),
          caption: neo4jNode.properties['_caption'],
          members: neo4jNode.properties['_members'].map(member => {
            const node = nodes.find(node => node.id === member)
            return {
              position: node.position,
              nodeId: node.id,
              radius: node.style.radius || style.radius
            }
          })
        }
        dispatch(createCluster(cluster.id, cluster.caption, cluster.position, 'cluster', cluster.members, cluster.initialPosition))
      })
      dispatch(fetchingGraphSucceeded({ nodes, relationships, style }))
    })
}