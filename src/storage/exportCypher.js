import {styleKeyToDatabaseKey} from "../model/properties";
const plainIdentifier = new RegExp('^[A-Za-z][A-Za-z_]*$')

const escape = name => {
  if (plainIdentifier.test(name)) {
    return name
  } else {
    return '`' + name + '`'
  }
}

const quote = value => {
  if (typeof value === Number || !isNaN(parseFloat(value))) {
    return value
  } else {
    return '"' + value + '"'
  }
}

const space = (left, right) => {
  return [left, right].filter(part => part).join(' ')
}

const entityProperties = (entity, includeStyling) => {
  const propertyEntries = Object.entries(entity.properties)
    .map(([key, value]) => `${escape(key)}: ${quote(value)}`)
  const styleEntries = Object.entries(entity.style)
    .map(([key, value]) => `${escape(styleKeyToDatabaseKey(key))}: ${quote(value)}`)

  const entries = includeStyling ? propertyEntries.concat(styleEntries) : propertyEntries
  if (entries.length > 0) {
    return '{' + entries.join(', ') + '}'
  } else {
    return null
  }
}

export const exportCypher = (graph, keyword, includeStyling) => {
  const captionMap = {}
  graph.nodes.forEach(node => {
    if (node.caption) {
      if (captionMap[node.caption]) {
        captionMap[node.caption].push(node)
      } else {
        captionMap[node.caption] = [node]
      }
    }
  })
  const idMap = {}
  graph.nodes.forEach(node => {
    if (node.caption && captionMap[node.caption].length === 1) {
      idMap[node.id] = escape(node.caption)
    } else {
      idMap[node.id] = node.id
    }
  })
  return [
    ...graph.nodes.map(node => {
      const labels = node.labels.map(label => `:${label}`).join('')
      const properties = entityProperties(node, includeStyling)
      return `${keyword} (${space(idMap[node.id] + labels, properties)})`;
    }),
    ...graph.relationships.map(relationship => {
      let type = relationship.type || '_RELATED'
      if (type === '_RELATED' && keyword === 'MATCH') {
        type = null
      }
      const properties = entityProperties(relationship, includeStyling)
      const relationshipSpec = type || properties ? `[${space(type ? ':' + type : null, properties)}]` : ''
      return `${keyword} (${idMap[relationship.fromId]})-${relationshipSpec}->(${idMap[relationship.toId]})`;
    })
  ].join('\n')
}