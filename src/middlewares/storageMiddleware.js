import { updateStore as updateNeoStore } from "../storage/neo4jStorage"
import {renameGoogleDriveStore, saveFile} from "../actions/googleDrive";
import {updatingGraph, updatingGraphSucceeded} from "../actions/neo4jStorage";

const updateQueue = []

const driveUpdateInterval = 1000 // ms
let waiting

const deBounce = (func, delay) => {
  clearTimeout(waiting)
  waiting = setTimeout(func, delay)
}

export const storageMiddleware = store => next => action => {
  const state = store.getState()
  const storage = state.storage

  if (action.type === 'SET_DIAGRAM_NAME') {
    if (storage.mode === "GOOGLE_DRIVE") {
      renameGoogleDriveStore(storage.googleDrive.fileId, action.diagramName)
    }
  }
  if (action.category === 'GRAPH') {

    switch (storage.mode) {
      case "GOOGLE_DRIVE":
        const oldState = store.getState()
        const result = next(action)
        const newState = store.getState()
        if (oldState.graph !== newState.graph) {
          if (oldState.storageStatus.status !== 'UPDATING_GRAPH') {
            store.dispatch(updatingGraph())
          }
          deBounce(() => {
            saveFile(
              newState.graph,
              storage.googleDrive.fileId,
              newState.diagramName,
              () => {
                store.dispatch(updatingGraphSucceeded())
              }
            )
          }, driveUpdateInterval)
        }
        return result
      case "DATABASE":
        updateQueue.push(action)
        drainUpdateQueue(state)
        return next(action)
      default:
        return next(action)
    }
  } else {
    return next(action)
  }
}

const drainUpdateQueue = (state) => {
  const applyHead = () => {
    if (updateQueue.length > 0) {
      const action = updateQueue[0]

      updateNeoStore(action, state)
        .then(() => {
          updateQueue.shift()
          applyHead()
        })
        .catch(error => console.log(error))
    }
  }

  applyHead()
}
