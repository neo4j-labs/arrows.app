import {stringTypeToDatabaseType} from "../model-old/Relationship";
import {propertyKeyToDatabaseKey, styleKeyToDatabaseKey} from "../model-old/properties";
import { nodeStyleAttributes, relationshipStyleAttributes } from "../model-old/styling";
import {labelToDatabaseLabel} from "../model-old/labels";
import {selectedNodeIds, selectedRelationshipIds} from "../model-old/selection";

export const writeQueriesForAction = (action, graph) => {

  switch (action.type) {
    case 'CREATE_NODE': {
      const styleProperties = {}
      if (action.style) {
        Object.keys(action.style).forEach((key) => {
          styleProperties[styleKeyToDatabaseKey(key)] = action.style[key]
        })
      }

      return (session) => session.run('CREATE (n:Diagram0 {_id: $id, _x: $x, _y: $y, ' +
        '_caption: $caption}) SET n += $style', {
        id: action.newNodeId,
        x: action.newNodePosition.x,
        y: action.newNodePosition.y,
        caption: action.caption,
        style: styleProperties
      })
    }

    case 'CREATE_NODE_AND_RELATIONSHIP': {
      const styleProperties = {}
      if (action.style) {
        Object.keys(action.style).forEach((key) => {
          styleProperties[styleKeyToDatabaseKey(key)] = action.style[key]
        })
      }

      return (session) => session.run('MATCH (n:Diagram0 {_id: $sourceNodeId}) ' +
        'CREATE (n)-[:_RELATED {_id: $newRelationshipId}]->' +
        '(t:Diagram0 {_id: $targetNodeId, _x: $x, _y: $y, ' +
        '_caption: $caption}) SET t += $style', {
        sourceNodeId: action.sourceNodeId,
        newRelationshipId: action.newRelationshipId,
        targetNodeId: action.targetNodeId,
        x: action.targetNodePosition.x,
        y: action.targetNodePosition.y,
        caption: action.caption,
        style: styleProperties
      })
    }

    case 'CONNECT_NODES': {
      return (session) => session.run('MATCH (source:Diagram0 {_id: $sourceNodeId}), (target:Diagram0 {_id: $targetNodeId}) ' +
        'CREATE (source)-[:_RELATED {_id: $newRelationshipId}]->(target)', {
        sourceNodeId: action.sourceNodeId,
        newRelationshipId: action.newRelationshipId,
        targetNodeId: action.targetNodeId
      })
    }

    case 'SET_NODE_CAPTION': {
      return (session) => session.run('MATCH (n:Diagram0) WHERE n._id IN $ids ' +
        'SET n._caption = $caption', {
        ids: selectedNodeIds(action.selection),
        caption: action.caption
      })
    }

    case 'ADD_LABEL': {
      return (session) => session.run('MATCH (n:Diagram0) WHERE n._id IN $ids ' +
        'SET n:`' + labelToDatabaseLabel(action.label) + '`', {
        ids: selectedNodeIds(action.selection)
      })
    }

    case 'RENAME_LABEL': {
      return (session) => session.run('MATCH (n:Diagram0) WHERE n._id IN $ids ' +
        'SET n:`' + labelToDatabaseLabel(action.newLabel) + '`' +
        'REMOVE n:`' + labelToDatabaseLabel(action.oldLabel) + '`', {
        ids: selectedNodeIds(action.selection)
      })
    }

    case 'REMOVE_LABEL': {
      return (session) => session.run('MATCH (n:Diagram0) WHERE n._id IN $ids ' +
        'REMOVE n:`' + labelToDatabaseLabel(action.label) + '`', {
        ids: selectedNodeIds(action.selection)
      })
    }

    case 'RENAME_PROPERTY': {
      return (session) => {
        session.run('MATCH (n:Diagram0) WHERE n._id IN $ids ' +
          'SET n.`' + propertyKeyToDatabaseKey(action.newPropertyKey) + '` = n.`' + propertyKeyToDatabaseKey(action.oldPropertyKey) + '` ' +
          'REMOVE n.`' + propertyKeyToDatabaseKey(action.oldPropertyKey) + '`', {
          ids: selectedNodeIds(action.selection)
        });
        return session.run('MATCH (:Diagram0)-[r]->(:Diagram0) WHERE r._id IN $ids ' +
          'SET r.`' + propertyKeyToDatabaseKey(action.newPropertyKey) + '` = r.`' + propertyKeyToDatabaseKey(action.oldPropertyKey) + '` ' +
          'REMOVE r.`' + propertyKeyToDatabaseKey(action.oldPropertyKey) + '`', {
          ids: selectedRelationshipIds(action.selection)
        });
      }
    }

    case 'SET_PROPERTY': {
      const properties = {}
      properties[propertyKeyToDatabaseKey(action.key)] = action.value
      return (session) => {
        session.run('MATCH (n:Diagram0) WHERE n._id IN $ids ' +
          'SET n += $properties', {
          ids: selectedNodeIds(action.selection),
          properties: properties
        });
        return session.run('MATCH (:Diagram0)-[r]->(:Diagram0) WHERE r._id IN $ids ' +
          'SET r += $properties', {
          ids: selectedRelationshipIds(action.selection),
          properties: properties
        });
      }
    }

    case 'SET_ARROWS_PROPERTY': {
      const databaseKey = styleKeyToDatabaseKey(action.key)
      const styleProperties = { [databaseKey]: action.value }
      const queries = []

      if (nodeStyleAttributes.includes(action.key)) {
        queries.push({
          cypher: 'MATCH (n:Diagram0) WHERE n._id IN $ids SET n += $properties',
          params: {
            ids: selectedNodeIds(action.selection),
            properties: styleProperties
          }
        })
      }

      if(relationshipStyleAttributes.includes(action.key)) {
        queries.push({
          cypher: 'MATCH (:Diagram0)-[r]->(:Diagram0) WHERE r._id IN $ids SET r += $properties',
          params: {
            ids: selectedRelationshipIds(action.selection),
            properties: styleProperties
          }
        })
      }

      return (session) => {
        const promises = queries.map(query => session.run(query.cypher, query.params))
        return Promise.all(promises)
      }
    }

    case 'REMOVE_ARROWS_PROPERTY': {
      return (session) => {
        session.run('MATCH (n:Diagram0) WHERE n._id IN $ids ' +
          'REMOVE n.`' + styleKeyToDatabaseKey(action.key) + '`', {
          ids: selectedNodeIds(action.selection)
        });
        return session.run('MATCH (:Diagram0)-[r]->(:Diagram0) WHERE r._id IN $ids ' +
          'REMOVE r.`' + styleKeyToDatabaseKey(action.key) + '`', {
          ids: selectedRelationshipIds(action.selection)
        });
      }
    }

    case 'REMOVE_PROPERTY': {
      return (session) => {
        session.run('MATCH (n:Diagram0) WHERE n._id IN $ids ' +
          'REMOVE n.`' + propertyKeyToDatabaseKey(action.key) + '`', {
          ids: selectedNodeIds(action.selection)
        });
        return session.run('MATCH (:Diagram0)-[r]->(:Diagram0) WHERE r._id IN $ids ' +
          'REMOVE r.`' + propertyKeyToDatabaseKey(action.key) + '`', {
          ids: selectedRelationshipIds(action.selection)
        });
      }
    }

    case 'SET_GRAPH_STYLE': {
      const databaseKey = styleKeyToDatabaseKey(action.key)
      const styleProperties = { [databaseKey]: action.value }

      return (session) => {
        return session.run('MERGE (n:Diagram) WITH n SET n += $properties', {
          properties: styleProperties
        });
      }
    }

    case 'SET_GRAPH_STYLES': {
      const styleProperties = {}
      for (const [key, value] of Object.entries(action.style)) {
        const databaseKey = styleKeyToDatabaseKey(key)
        styleProperties[databaseKey] = value
      }

      return (session) => {
        return session.run('MERGE (n:Diagram) WITH n SET n += $properties', {
          properties: styleProperties
        });
      }
    }

    case 'MOVE_NODES_END_DRAG': {
      if (action.nodePositions.length !== 0) {
        return (session) => {
          let result = session
          action.nodePositions.forEach(({nodeId, position}) => {
            result = session.run('MATCH (n:Diagram0 {_id: $id}) ' +
              'SET n._x = $x, n._y = $y', {
              id: nodeId,
              x: position.x,
              y: position.y
            })
          })
          return result
        }
      }
      return () => Promise.resolve("Nothing to do")
    }

    case 'SET_RELATIONSHIP_TYPE': {
      const newType = stringTypeToDatabaseType(action.relationshipType)
      return (session) => {
        let result = session
        selectedRelationshipIds(action.selection).forEach((relationshipId) => {
          result = session.run(`MATCH (n)-[r]->(m)
            WHERE r._id = $id
            CREATE (n)-[r2:\`${newType}\`]->(m)
            SET r2 = r
            WITH r
            DELETE r`, {
            id: relationshipId
          })
        })
        return result
      }
    }

    case 'DUPLICATE_NODES_AND_RELATIONSHIPS': {
      return session => {
        let result = session
        Object.keys(action.nodeIdMap).forEach(newNodeId => {
          const spec = action.nodeIdMap[newNodeId];
          result = session.run(`MATCH (old:Diagram0 {_id: $oldNodeId})
            WITH old
            CREATE (new:Diagram0)
            SET new = old
            SET new._id = $newNodeId
            SET new._x = $x, new._y = $y`, {
            oldNodeId: spec.oldNodeId,
            newNodeId,
            x: spec.position.x,
            y: spec.position.y
          })
        })
        Object.keys(action.relationshipIdMap).forEach(newRelationshipId => {
          const spec = action.relationshipIdMap[newRelationshipId]
          const newType = stringTypeToDatabaseType(spec.relationshipType)
          result = session.run(`MATCH ()-[old]->()
            WHERE old._id = $oldRelationshipId
            WITH old
            MATCH (source:Diagram0 {_id: $sourceId}), (target:Diagram0 {_id: $targetId})
            CREATE (source)-[new:\`${newType}\`]->(target)
            SET new = old
            SET new._id = $newRelationshipId`, {
            oldRelationshipId: spec.oldRelationshipId,
            newRelationshipId,
            sourceId: spec.fromId,
            targetId: spec.toId,
            newType
          })
        })
        return result
      }
    }

    case 'DELETE_NODES_AND_RELATIONSHIPS': {
      const nodeIds = Object.keys(action.nodeIdMap)
      const relIds = Object.keys(action.relationshipIdMap)
      return session => {
        let result = session
        if (relIds.length > 0) {
          result = session.run(`match(d:Diagram0)-[r]-()
          where r._id in $ids
          delete r`, {
              ids: relIds
            }
          )
        }
        if (nodeIds.length > 0) {
          result = session.run(`match(d:Diagram0)
          where d._id in $ids
          detach delete d`, {
              ids: nodeIds
            }
          )
        }
        return result
      }
    }

    case 'REVERSE_RELATIONSHIPS': {
      return (session) => {
        let result = session
        selectedRelationshipIds(action.selection).forEach((relationshipId) => {
          const relationship = graph.relationships.find(rel => rel.id === relationshipId)
          const type = stringTypeToDatabaseType(relationship.type)
          result = session.run(`MATCH (s1)-[old]->(s2)
            WHERE old._id = $id
            CREATE (s2)-[new:\`${type}\`]->(s1)
            SET new = old
            DELETE old`, {
            id: relationshipId
          })
        })
        return result
      }
    }

    default:
      return () => Promise.resolve("Nothing to do")
  }
}