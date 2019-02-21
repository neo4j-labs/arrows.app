import { updateStore as updateNeoStore } from "../storage/neo4jStorage"
import {renameGoogleDriveStore, saveFile} from "../actions/googleDrive";
import {updatingGraph, updatingGraphSucceeded} from "../actions/neo4jStorage";
import { hideGraphHistory } from "../selectors"
import { ActionCreators as UndoActionCreators } from "redux-undo"

const updateQueue = []

const driveUpdateInterval = 1000 // ms
let waiting

const deBounce = (func, delay) => {
  clearTimeout(waiting)
  waiting = setTimeout(func, delay)
}

const historyActions = [UndoActionCreators.undo().type, UndoActionCreators.redo().type]

export const storageMiddleware = store => next => action => {
  const state = hideGraphHistory(store.getState())
  const storage = state.storage

  if (action.type === 'SET_DIAGRAM_NAME') {
    if (storage.mode === "GOOGLE_DRIVE") {
      renameGoogleDriveStore(storage.googleDrive.fileId, action.diagramName)
    }
  }

  if (action.category === 'GRAPH' || historyActions.includes(action.type)) {
    switch (storage.mode) {
      case "GOOGLE_DRIVE":
        const oldState = hideGraphHistory(store.getState())
        const result = next(action)
        const newState = hideGraphHistory(store.getState())
        const data = {graph: newState.graph}
        const layers = newState.applicationLayout.layers

        if (layers && layers.length > 0) {
          layers.forEach(layer => {
            if (layer.persist && layer.storageActionHandler && layer.storageActionHandler['googleDrive']) {
              data[layer.name] = layer.storageActionHandler['googleDrive'](newState)
            }
          })
        }

        if (oldState.graph !== newState.graph || oldState.gangs !== newState.gangs) {
          if (oldState.storageStatus.status !== 'UPDATING_GRAPH') {
            store.dispatch(updatingGraph())
          }
          deBounce(() => {
            saveFile(
              data,
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
        if (action.category === 'GRAPH') {
          updateQueue.push(action)
          drainUpdateQueue(state)
        }
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
