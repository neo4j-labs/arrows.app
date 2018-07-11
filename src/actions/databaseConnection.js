import {fetchGraphFromDatabase, updateDriver} from "../storage/neo4jStorage";
const neo4j = require("neo4j-driver/lib/browser/neo4j-web.min.js").v1;

const localStorageKey = "neo4j-arrows-app.rememberedConnectionParameters";

const rememberConnectionParameters = (connectionParameters) => {
  const serializedVal = JSON.stringify(connectionParameters)
  localStorage.setItem(localStorageKey, serializedVal)
}

export const useRememberedConnectionParameters = () => {
  const serializedVal = localStorage.getItem(localStorageKey)
  const parsedVal = JSON.parse(serializedVal)
  if (parsedVal && parsedVal.connectionUri) {
    return updateConnectionParameters(parsedVal)
  } else {
    return () => {}
  }
}

export const updateConnectionParameters = (connectionParameters) => {
  return function (dispatch) {
    const {connectionUri, username, password} = connectionParameters
    try {
      const driver = neo4j.driver(connectionUri, neo4j.auth.basic(username, password))
      const session = driver.session()
      session.run("RETURN 1").then(() => {
        session.close()
        if (connectionParameters.rememberCredentials) {
          rememberConnectionParameters(connectionParameters)
        }
        updateDriver(driver)
        dispatch(successfulUpdate(connectionParameters))
        dispatch(fetchGraphFromDatabase())
      }).catch(function (error) {
        dispatch(unsuccessfulUpdate(connectionParameters, error.message))
      });
    }
    catch (error) {
      dispatch(unsuccessfulUpdate(connectionParameters, error.message))
    }
  }
}

const unsuccessfulUpdate = (connectionParameters, errorMsg) => {
  return {
    type: 'FAILED_DATABASE_CONNECTION',
    connectionParameters,
    errorMsg
  }
}

const successfulUpdate = (connectionParameters) => {
  return {
    type: 'UPDATE_CONNECTION_PARAMETERS',
    connectionParameters
  }
}

export const cancelEditing = () => {
  return {
    type: 'CANCEL_EDIT_CONNECTION_PARAMETERS'
  }
}
