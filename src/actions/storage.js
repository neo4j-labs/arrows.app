import {fetchGraphFromDatabase} from "../storage/neo4jStorage";
import {fetchGraphFromDrive} from "../storage/googleDriveStorage";
import {loadGraphFromLocalStorage} from "./localStorage";

export const localUrlRegex = /^#\/local/
export const googleDriveUrlRegex = /^#\/googledrive\/ids=(.*)/

export function initialiseStorageFromWindowLocationHash(store) {
  const hash = window.location.hash

  const localMatch = localUrlRegex.exec(hash)
  if (localMatch) {
    store.dispatch(loadGraphFromLocalStorage())
  }

  const googleDriveMatch = googleDriveUrlRegex.exec(hash)
  if (googleDriveMatch && googleDriveMatch.length > 1) {
    const initialFiles = googleDriveMatch[1].split(',')
    if (initialFiles.length > 0) {
      const fileId = initialFiles[0]
      store.dispatch(getFileFromGoogleDrive(fileId))
    }
  }
}

export function newGoogleDriveDiagram() {
  return {
    type: 'NEW_GOOGLE_DRIVE_DIAGRAM'
  }
}

export function newLocalStorageDiagram() {
  return {
    type: 'NEW_LOCAL_STORAGE_DIAGRAM'
  }
}

export function getFileFromGoogleDrive(fileId) {
  return {
    type: 'GET_FILE_FROM_GOOGLE_DRIVE',
    fileId
  }
}

export function storeCurrentDiagramAsNewFileOnGoogleDrive() {
  return {
    type: 'STORE_CURRENT_DIAGRAM_AS_NEW_FILE_ON_GOOGLE_DRIVE'
  }
}

export function usingLocalStorage() {
  return {
    type: 'USE_LOCAL_STORAGE'
  }
}

export function createdFileOnGoogleDrive(fileId) {
  return {
    type: 'CREATED_FILE_ON_GOOGLE_DRIVE',
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

export const pickDiagram = () => ({
  type: 'PICK_DIAGRAM'
})

export const pickDiagramCancel = () => ({
  type: 'PICK_DIAGRAM_CANCEL'
})

export function fetchingGraph() {
  return {
    type: 'FETCHING_GRAPH'
  }
}

export function fetchingGraphFailed() {
  return {
    type: 'FETCHING_GRAPH_FAILED'
  }
}

export function fetchingGraphSucceeded(storedGraph) {
  return {
    type: 'FETCHING_GRAPH_SUCCEEDED',
    storedGraph
  }
}

export function updatingGraph() {
  return {
    type: 'UPDATING_GRAPH'
  }
}

export function updatingGraphFailed() {
  return {
    type: 'UPDATING_GRAPH_FAILED'
  }
}

export function updatingGraphSucceeded() {
  return {
    type: 'UPDATING_GRAPH_SUCCEEDED'
  }
}