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
  editingStorageConfiguration: true,
  databaseConnectionParameters: initialConnectionParameters(),
  errorMsg: null
}, action) {
  switch (action.type) {
    case 'UPDATE_CONNECTION_PARAMETERS':
      return {
        editingStorageConfiguration: false,
        databaseConnectionParameters: action.storageConfiguration,
        errorMsg: null
      }

    case 'FAILED_DATABASE_CONNECTION':
      return {
        editingStorageConfiguration: true,
        databaseConnectionParameters: action.storageConfiguration,
        errorMsg: action.errorMsg
      }

    case 'CANCEL_EDIT_CONNECTION_PARAMETERS':
      return {
        ...state,
        editingStorageConfiguration: false
      }

    default:
      return state
  }
}