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
  viewingConfig: false,
  database: {
    connectionParametersEditable: true,
    connectionParameters: initialConnectionParameters(),
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
    case 'VIEW_STORAGE_CONFIG':
      return {
        ...state,
        viewingConfig: true
      }

    case 'HIDE_STORAGE_CONFIG':
      return {
        ...state,
        viewingConfig: false
      }

    case 'DISABLE_EDITING_CONNECTION_PARAMETERS':
      return {
        ...state,
        database: {
          ...state.database,
          connectionParametersEditable: false
        }
      }

    case 'UPDATE_CONNECTION_PARAMETERS':
      return {
        ...state,
        viewingConfig: false,
        database: {
          ...state.database,
          showDisconnectedDialog: false,
          connectionParameters: action.connectionParameters,
          errorMsg: null
        }
      }

    case 'FAILED_DATABASE_CONNECTION':
      return {
        ...state,
        viewingConfig: state.database.connectionParametersEditable,
        database: {
          ...state.database,
          showDisconnectedDialog: state.database.connectionParametersEditable,
          connectionParameters: action.connectionParameters,
          errorMsg: action.errorMsg
        }
      }

    case 'DESKTOP_DISCONNECTED':
      return {
        ...state,
        database: {
          ...state.database,
          showDisconnectedDialog: true,
          connectionParameters: null
        }
      }

    default:
      return state
  }
}