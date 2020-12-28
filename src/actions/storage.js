import {fetchGraphFromDatabase} from "../storage/neo4jStorage";
import {fetchGraphFromDrive} from "../storage/googleDriveStorage";
import {key_appData} from "./localStorage";

export const localUrlNoIdRegex = /^#\/local$/
export const localUrlRegex = /^#\/local\/id=(.*)/
export const googleDriveUrlRegex = /^#\/googledrive\/ids=(.*)/

export function initialiseStorageFromWindowLocationHash(store) {
  const hash = window.location.hash

  const localNoIdMatch = localUrlNoIdRegex.exec(hash)
  const localMatch = localUrlRegex.exec(hash)
  const googleDriveMatch = googleDriveUrlRegex.exec(hash)

  if (localNoIdMatch) {
    store.dispatch(getFileFromLocalStorage(key_appData))
  } else if (localMatch) {
    const fileId = localMatch[1]
    store.dispatch(getFileFromLocalStorage(fileId))
  } else if (googleDriveMatch && googleDriveMatch.length > 1) {
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

export function getFileFromLocalStorage(fileId) {
  return {
    type: 'GET_FILE_FROM_LOCAL_STORAGE',
    fileId
  }
}

export function postCurrentDiagramAsNewFileOnGoogleDrive() {
  return {
    type: 'POST_CURRENT_DIAGRAM_AS_NEW_FILE_ON_GOOGLE_DRIVE'
  }
}

export function postedFileOnGoogleDrive(fileId) {
  return {
    type: 'POSTED_FILE_ON_GOOGLE_DRIVE',
    fileId
  }
}

export function postedFileToLocalStorage() {
  return {
    type: 'POSTED_FILE_TO_LOCAL_STORAGE'
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
        if (storage.fileId) {
          dispatch(fetchGraphFromDrive(storage.fileId))
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

export function gettingGraph() {
  return {
    type: 'GETTING_GRAPH'
  }
}

export function gettingGraphFailed() {
  return {
    type: 'GETTING_GRAPH_FAILED'
  }
}

export function gettingGraphSucceeded(storedGraph) {
  return {
    type: 'GETTING_GRAPH_SUCCEEDED',
    storedGraph
  }
}

export function putGraph() {
  return {
    type: 'PUT_GRAPH'
  }
}

export function puttingGraph() {
  return {
    type: 'PUTTING_GRAPH'
  }
}

export function puttingGraphFailed() {
  return {
    type: 'PUTTING_GRAPH_FAILED'
  }
}

export function puttingGraphSucceeded() {
  return {
    type: 'PUTTING_GRAPH_SUCCEEDED'
  }
}