const defaultName = 'Untitled graph'

const diagramName = (state = defaultName, action) => {
  switch (action.type) {
    case 'NEW_GOOGLE_DRIVE_DIAGRAM':
    case 'NEW_LOCAL_STORAGE_DIAGRAM':
      return defaultName

    case 'SET_DIAGRAM_NAME':
      return action.diagramName

    default:
      return state
  }
}

export default diagramName