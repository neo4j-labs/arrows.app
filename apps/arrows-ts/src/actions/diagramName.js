export const gettingDiagramNameSucceeded = (diagramName) => ({
  type: 'GETTING_DIAGRAM_NAME_SUCCEEDED',
  diagramName
})

export const renameDiagram = (diagramName) => ({
  type: 'RENAME_DIAGRAM',
  diagramName
})