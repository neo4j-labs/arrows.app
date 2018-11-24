export const defaultConnectionUri = "bolt://localhost";

const initialConnectionParameters = () => {
  return {
    connectionUri: defaultConnectionUri,
    username: "",
    password: "",
    rememberCredentials: false
  }
}

export default function databaseConnection(state = {
  connectionParametersEditable: true,
  editingConnectionParameters: true,
  connectionParameters: initialConnectionParameters(),
  showDisconnectedDialog: false,
  errorMsg: null
}, action) {
  switch (action.type) {
    case 'DISABLE_EDITING_CONNECTION_PARAMETERS':
      return {
        ...state,
        connectionParametersEditable: false
      }

    case 'EDIT_CONNECTION_PARAMETERS':
      return {
        ...state,
        editingConnectionParameters: true
      }

    case 'CANCEL_EDIT_CONNECTION_PARAMETERS':
      return {
        ...state,
        editingConnectionParameters: false
      }

    case 'UPDATE_CONNECTION_PARAMETERS':
      return {
        ...state,
        editingConnectionParameters: false,
        showDisconnectedDialog: false,
        connectionParameters: action.connectionParameters,
        errorMsg: null
      }

    case 'FAILED_DATABASE_CONNECTION':
      return {
        ...state,
        editingConnectionParameters: state.connectionParametersEditable,
        showDisconnectedDialog: !state.connectionParametersEditable,
        connectionParameters: action.connectionParameters,
        errorMsg: action.errorMsg
      }

    case 'DESKTOP_DISCONNECTED':
      return {
        connectionParameters: null,
        showDisconnectedDialog: true
      }

    default:
      return state
  }
}