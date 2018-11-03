const diagramName = (state = 'Untitled graph', action) => {
  switch (action.type) {
    case 'SET_DIAGRAM_NAME':
      return action.diagramName

    default:
      return state
  }
}

export default diagramName