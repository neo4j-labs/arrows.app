import {fetchGraphFromDrive} from "../storage/googleDriveStorage";
import {initializeConnection} from "./databaseConnection";
import {fetchGraphFromDatabase} from "../storage/neo4jStorage";

export const googleDriveUrlRegex = /^#\/googledrive\/ids=(.*)/
export const neo4jUrlRegex = /^#\/neo4j/

export function initialiseStorageFromWindowLocationHash() {
  return function (dispatch) {

    const googleDriveMatch = googleDriveUrlRegex.exec(window.location.hash)
    if (googleDriveMatch && googleDriveMatch.length > 1) {
      const initialFiles = googleDriveMatch[1].split(',')
      if (initialFiles.length > 0) {
        const fileId = initialFiles[0]
        dispatch(useGoogleDriveStorage(fileId))
        window.addEventListener("load", () => {
          dispatch(fetchGraphFromDrive(fileId))
        })
      }
    }

    const neo4jMatch = neo4jUrlRegex.exec(window.location.hash)
    if (neo4jMatch) {
      dispatch(useNeo4jStorage())
      dispatch(initializeConnection())
      dispatch(fetchGraphFromDatabase())
    }
  }
}

export function useNeo4jStorage() {
  return {
    type: 'USE_NEO4J_STORAGE'
  }
}

export function useGoogleDriveStorage(fileId) {
  return {
    type: 'USE_GOOGLE_DRIVE_STORAGE',
    fileId
  }
}
