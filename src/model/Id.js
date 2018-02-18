export function neo4jId(value) {
  return {
    type: 'NEO4J',
    value: value
  }
}

export function syntheticId(value) {
  return {
    type: 'SYNTHETIC',
    value: value
  }
}

export function asKey(id) {
  return id.type + '_' + id.value
}

export function idsMatch(a, b) {
  return a && b && a.type === b.type && a.value === b.value
}