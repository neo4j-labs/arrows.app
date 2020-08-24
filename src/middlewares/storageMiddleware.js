import { updateStore as updateNeoStore } from "../storage/neo4jStorage"
import {renameGoogleDriveStore, saveFile} from "../actions/googleDrive";
import {updatingGraph, updatingGraphSucceeded} from "../actions/neo4jStorage";
import { getPresentGraph } from "../selectors"
import { ActionCreators as UndoActionCreators } from "redux-undo"
import { saveAppData } from "../actions/localStorage"
import {updateGoogleDriveFileId} from "../actions/storage";

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

  const state = hideGraphHistory(store.getState())
  const storage = state.storage

  if (action.type === 'SET_DIAGRAM_NAME') {
    if (storage.mode === "GOOGLE_DRIVE") {
      renameGoogleDriveStore(storage.googleDrive.fileId, action.diagramName)
    }
  }

  if (action.category === 'GRAPH' || historyActions.includes(action.type)) {
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

    switch (storage.mode) {
      case "LOCAL_STORAGE":
        if (oldState.graph !== newState.graph || oldState.gangs !== newState.gangs) {
          if (oldState.storageStatus.status !== 'UPDATING_GRAPH') {
            store.dispatch(updatingGraph())
          }

          saveAppData(data)
          store.dispatch(updatingGraphSucceeded())
        }
        return result

      case "GOOGLE_DRIVE":
        if (oldState.graph !== newState.graph || oldState.gangs !== newState.gangs) {
          if (oldState.storageStatus.status !== 'UPDATING_GRAPH') {
            store.dispatch(updatingGraph())
          }

          deBounce(() => {
            saveFile(
              data,
              storage.googleDrive.fileId,
              newState.diagramName,
              (fileId) => {
                store.dispatch(updateGoogleDriveFileId(fileId))
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
        return result
      default:
        return result
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
