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
  editingStorageConfiguration: false,
  databaseConnectionParameters: initialConnectionParameters(),
  errorMsg: null
}, action) {
  switch (action.type) {
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
        editingStorageConfiguration: false,
        databaseConnectionParameters: action.connectionParameters,
        errorMsg: null
      }

    case 'FAILED_DATABASE_CONNECTION':
      return {
        editingStorageConfiguration: true,
        databaseConnectionParameters: action.connectionParameters,
        errorMsg: action.errorMsg
      }

    default:
      return state
  }
}