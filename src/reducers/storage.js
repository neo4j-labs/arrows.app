export const defaultConnectionUri = "bolt://localhost";

const initialConnectionParameters = () => {
  return {
    connectionUri: defaultConnectionUri,
    username: "",
    password: "",
    rememberCredentials: false
  }
}

export default function storage(state = {
  mode: 'NONE',
  database: {
    connectionParameters: initialConnectionParameters(),
    editingConnectionParameters: false,
    connectionParametersEditable: true,
    showDisconnectedDialog: false,
    errorMsg: null
  },
  googleDrive: {}
}, action) {
  switch (action.type) {
    case 'NEW_DIAGRAM': {
      return {
        ...state,
        mode: 'NONE'
      }
    }
    case 'OPEN_DIAGRAM': {
      return {
        ...state,
        previousMode: state.mode,
        mode: 'OPEN_DIAGRAM'
      }
    }
    case 'USE_NEO4J_STORAGE':
      return {
        ...state,
        mode: 'DATABASE'
      }
    case 'USE_GOOGLE_DRIVE_STORAGE':
      return {
        ...state,
        mode: 'GOOGLE_DRIVE',
      }
    case 'USE_LOCAL_STORAGE':
      return {
        ...state,
        mode: 'LOCAL_STORAGE',
      }
    case 'UPDATE_GOOGLE_DRIVE_FILE_ID':
      return {
        ...state,
        googleDrive: {
          ...state.googleDrive,
          fileId: action.fileId
        }
      }
    case 'GOOGLE_DRIVE_SIGN_IN_STATUS':
      return {
        ...state,
        googleDrive: {
          ...state.googleDrive,
          signedIn: action.signedIn
        }
      }
    case 'EDIT_CONNECTION_PARAMETERS':
      return {
        ...state,
        database: {
          ...state.database,
          editingConnectionParameters: true
        }
      }

    case 'CANCEL_EDIT_CONNECTION_PARAMETERS':
      return {
        ...state,
        database: {
          ...state.database,
          editingConnectionParameters: false
        }
      }

    case 'UPDATE_CONNECTION_PARAMETERS':
      return {
        ...state,
        database: {
          ...state.database,
          editingConnectionParameters: false,
          showDisconnectedDialog: false,
          connectionParameters: action.connectionParameters,
          errorMsg: null
        }
      }

    case 'FAILED_DATABASE_CONNECTION':
      return {
        ...state,
        database: {
          ...state.database,
          editingConnectionParameters: state.database.connectionParametersEditable,
          showDisconnectedDialog: !state.database.connectionParametersEditable,
          connectionParameters: action.connectionParameters,
          errorMsg: action.errorMsg
        }
      }

    default:
      return state
  }
}
