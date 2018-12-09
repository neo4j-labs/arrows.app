import {initializeConnection} from "./databaseConnection";
import {fetchGraphFromDatabase} from "../storage/neo4jStorage";
import {fetchGraphFromDrive} from "../storage/googleDriveStorage";

export const googleDriveUrlRegex = /^#\/googledrive\/ids=(.*)/
export const neo4jUrlRegex = /^#\/neo4j/

export function initialiseStorageFromWindowLocationHash(store) {
  const googleDriveMatch = googleDriveUrlRegex.exec(window.location.hash)
  if (googleDriveMatch && googleDriveMatch.length > 1) {
    const initialFiles = googleDriveMatch[1].split(',')
    if (initialFiles.length > 0) {
      const fileId = initialFiles[0]
      store.dispatch(useGoogleDriveStorage())
      store.dispatch(updateGoogleDriveFileId(fileId))
    }
  }

  const neo4jMatch = neo4jUrlRegex.exec(window.location.hash)
  if (neo4jMatch) {
    store.dispatch(useNeo4jStorage())
    store.dispatch(initializeConnection())
    store.dispatch(fetchGraphFromDatabase())
  }
}

export function useNeo4jStorage() {
  return {
    type: 'USE_NEO4J_STORAGE'
  }
}

export function useGoogleDriveStorage() {
  return {
    type: 'USE_GOOGLE_DRIVE_STORAGE'
  }
}

export function updateGoogleDriveFileId(fileId) {
  return {
    type: 'UPDATE_GOOGLE_DRIVE_FILE_ID',
    fileId
  }
}

export const googleDriveSignInStatusChanged = (signedIn) => ({
  type: 'GOOGLE_DRIVE_SIGN_IN_STATUS',
  signedIn
})

export const reloadGraph = () => {
  return function (dispatch, getState) {
    const { storage } = getState()
    switch (storage.mode) {
      case "GOOGLE_DRIVE":
        if (storage.googleDrive.fileId) {
          dispatch(fetchGraphFromDrive(storage.googleDrive.fileId))
        }
        break
      case "DATABASE":
        dispatch(fetchGraphFromDatabase())
        break
    }
  }
}