import {fetchGraphFromDatabase} from "../storage/neo4jStorage";
import {fetchGraphFromDrive} from "../storage/googleDriveStorage";
import { ActionCreators as UndoActionCreators } from 'redux-undo'

export function newGoogleDriveDiagram() {
  return function (dispatch) {
    dispatch({
      type: 'NEW_GOOGLE_DRIVE_DIAGRAM'
    })
    dispatch(UndoActionCreators.clearHistory())
  }
}

export function newLocalStorageDiagram() {
  return function (dispatch) {
    dispatch({
      type: 'NEW_LOCAL_STORAGE_DIAGRAM'
    })
    dispatch(UndoActionCreators.clearHistory())
  }
}

export function openRecentFile(entry) {
  switch (entry.mode) {
    case 'GOOGLE_DRIVE':
      return getFileFromGoogleDrive(entry.fileId)

    case 'LOCAL_STORAGE':
      return getFileFromLocalStorage(entry.fileId)

    default:
      return {}
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

export const cancelGoogleDriveAuthorization = () => (dispatch, getState) => {
  const state = getState()
  const { storage, recentStorage } = state
  const recentLocalFiles = recentStorage.filter(entry => entry.mode === 'LOCAL_STORAGE')

  if (storage.status === 'PICKING_FROM_GOOGLE_DRIVE') {
    dispatch(pickDiagramCancel())
  } else if (recentLocalFiles.length > 0) {
    dispatch(openRecentFile(recentLocalFiles[0]))
  } else {
    dispatch(newLocalStorageDiagram())
  }
}

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

export const pickDiagram = (mode) => ({
  type: 'PICK_DIAGRAM',
  mode
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
  return function (dispatch) {
    dispatch({
      type: 'GETTING_GRAPH_SUCCEEDED',
      storedGraph
    })
    dispatch(UndoActionCreators.clearHistory())
  }
}

export function putGraph() {
  return {
    type: 'PUT_GRAPH'
  }
}

export function postingGraph() {
  return {
    type: 'POSTING_GRAPH'
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