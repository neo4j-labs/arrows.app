export const combineLabels = (nodes) => {

  const allLabels = nodes.map(node => node.labels)
    .reduce((accumulator, currentValue) => [...new Set(accumulator.concat(currentValue))], [])

  const labels = {}
  allLabels.forEach(label => {
    labels[label] = {status: nodes.every(node => node.labels.includes(label)) ? 'CONSISTENT' : 'PARTIAL'}
  })
  return labels
}

export const summarizeLabels = (selectedEntities, graph) => {
  const labels = []

  const labelsInSelection = new Set()
  selectedEntities.forEach(entity => {
    if (entity.labels) {
      entity.labels.forEach(label => labelsInSelection.add(label))
    }
  })

  graph.nodes.forEach(node => {
    node.labels.forEach(label => {
      if (label && !labelsInSelection.has(label)) {
        const existingLabel = labels.find(labelEntry => labelEntry.label === label)
        if (existingLabel) {
          existingLabel.nodeCount++
        } else {
          labels.push({label, nodeCount: 1})
        }
      }
    })
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