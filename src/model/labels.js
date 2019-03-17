export const combineLabels = (nodes) => {

  const allLabels = nodes.map(node => node.labels)
    .reduce((accumulator, currentValue) => [...new Set(accumulator.concat(currentValue))], [])

  const labels = {}
  allLabels.forEach(label => {
    labels[label] = {status: nodes.every(node => node.labels.includes(label)) ? 'CONSISTENT' : 'PARTIAL'}
  })
  return labels
}

export const labelsFromDatabaseEntity = (entity) => {
  return entity.labels.filter(label => label !== 'Diagram0').map(databaseLabelToLabel)
}

export const labelToDatabaseLabel = (propertyKey) => {
  return propertyKey === '' ? '_EMPTY_LABEL' : propertyKey.replace(/_/g, '__')
}

const databaseLabelToLabel = (databaseKey) => {
  return databaseKey === '_EMPTY_LABEL' ? '' : databaseKey.replace(/__/g, '_')
}