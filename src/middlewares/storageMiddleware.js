import { updateStore as updateNeoStore } from "../storage/neo4jStorage"
import {renameGoogleDriveStore, saveFile } from "../actions/googleDrive";
import { getPresentGraph } from "../selectors"
import { ActionCreators as UndoActionCreators } from "redux-undo"
import { saveAppData } from "../actions/localStorage"
import {
  createdFileOnGoogleDrive,
  updatingGraph,
  updatingGraphSucceeded
} from "../actions/storage";
import {fetchGraphFromDrive} from "../storage/googleDriveStorage";

const updateQueue = []

const driveUpdateInterval = 1000 // ms
let waiting

const deBounce = (func, delay) => {
  clearTimeout(waiting)
  waiting = setTimeout(func, delay)
}

const historyActions = [UndoActionCreators.undo().type, UndoActionCreators.redo().type]

export const storageMiddleware = store => next => action => {
  const hideGraphHistory = state => ({
    ...state,
    graph: getPresentGraph(state)
  })

  const oldState = hideGraphHistory(store.getState())
  const result = next(action)
  const newState = hideGraphHistory(store.getState())
  const storage = newState.storage
  const graph = newState.graph

  if (action.type === 'SET_DIAGRAM_NAME') {
    if (storage.mode === "GOOGLE_DRIVE") {
      renameGoogleDriveStore(storage.googleDrive.fileId, action.diagramName)
    }
  }

  if (storage.mode === 'GOOGLE_DRIVE' && storage.googleDrive.signedIn) {
    switch (storage.status) {
      case 'GET': {
        const fileId = storage.googleDrive.fileId;
        store.dispatch(fetchGraphFromDrive(fileId))
        break
      }

      case 'POST': {
        const onFileSaved = (fileId) => {
          store.dispatch(createdFileOnGoogleDrive(fileId))
        }

        saveFile(graph, null, newState.diagramName, onFileSaved)
        break
      }
    }
  }

  if (action.category === 'GRAPH' || historyActions.includes(action.type)) {
    switch (storage.mode) {
      case "LOCAL_STORAGE":
        if (oldState.graph !== newState.graph || oldState.gangs !== newState.gangs) {
          if (oldState.storageStatus.status !== 'UPDATING_GRAPH') {
            store.dispatch(updatingGraph())
          }

          saveAppData({graph})
          store.dispatch(updatingGraphSucceeded())
        }
        break

      case "GOOGLE_DRIVE":
        if (oldState.graph !== newState.graph || oldState.gangs !== newState.gangs) {
          if (oldState.storageStatus.status !== 'UPDATING_GRAPH') {
            store.dispatch(updatingGraph())
          }

          deBounce(() => {
            saveFile(
              graph,
              storage.googleDrive.fileId,
              newState.diagramName,
              (fileId) => {
                if (fileId !== storage.googleDrive.fileId) {
                  console.warn("Unexpected change of fileId from %o to %o",
                    storage.googleDrive.fileId, fileId)
                }
                store.dispatch(updatingGraphSucceeded())
              }
            )
          }, driveUpdateInterval)
        }
        break

      case "DATABASE":
        if (action.category === 'GRAPH') {
          updateQueue.push(action)
          drainUpdateQueue(newState)
        }
        break
    }
  }
  return result
}

const drainUpdateQueue = (state) => {
  const applyHead = () => {
    if (updateQueue.length > 0) {
      const action = updateQueue.shift()

      updateNeoStore(action, state)
        .then(() => {
          applyHead()
        })
        .catch(error => console.log(error))
    }
  }

  applyHead()
}
