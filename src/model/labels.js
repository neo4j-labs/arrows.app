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
  return entity.labels
}