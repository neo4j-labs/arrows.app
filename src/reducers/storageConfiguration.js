export const defaultConnectionUri = "bolt://localhost";

const initialConnectionParameters = () => {
  return {
    connectionUri: defaultConnectionUri,
    username: "",
    password: "",
    rememberCredentials: false
  }
}

export default function storageConfiguration(state = {
  storageConfigurationEditable: true,
  editingStorageConfiguration: false,
  databaseConnectionParameters: initialConnectionParameters(),
  showDisconnectedDialog: false,
  errorMsg: null
}, action) {
  switch (action.type) {
    case 'DISABLE_EDITING_CONNECTION_PARAMETERS':
      return {
        ...state,
        storageConfigurationEditable: false
      }

    case 'EDIT_CONNECTION_PARAMETERS':
      return {
        ...state,
        editingStorageConfiguration: true
      }

    case 'CANCEL_EDIT_CONNECTION_PARAMETERS':
      return {
        ...state,
        editingStorageConfiguration: false
      }

    case 'UPDATE_CONNECTION_PARAMETERS':
      return {
        ...state,
        editingStorageConfiguration: false,
        showDisconnectedDialog: false,
        databaseConnectionParameters: action.connectionParameters,
        errorMsg: null
      }

    case 'FAILED_DATABASE_CONNECTION':
      return {
        ...state,
        editingStorageConfiguration: state.storageConfigurationEditable,
        showDisconnectedDialog: !state.storageConfigurationEditable,
        databaseConnectionParameters: action.connectionParameters,
        errorMsg: action.errorMsg
      }

    case 'DESKTOP_DISCONNECTED':
      return {
        databaseConnectionParameters: null,
        showDisconnectedDialog: true
      }

    default:
      return state
  }
}