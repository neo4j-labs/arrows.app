import { updateStore as updateNeoStore } from "../storage/neo4jStorage"
import {renameGoogleDriveStore, saveToStore as updateGoogleDriveStore} from "../actions/googleDrive";

const updateQueue = []

const driveUpdateInterval = 1000 // ms

const limitedUpdater = (() => {
  let lastUpdateTime = new Date()
  let nextUpdateTask = null
  let lastUpdateRequestTime = null
  let updating = false

  return {
    updateRequested: (updateRequest) => {
      lastUpdateRequestTime = new Date()

      const tryRun = (runRequestTime) => {
        const timeToRun = driveUpdateInterval - (runRequestTime - lastUpdateTime)

        if (timeToRun <= 0) {
          updating = true
          nextUpdateTask = null
          updateRequest(getUpdateCallback(runRequestTime))
        } else {
          if (nextUpdateTask) {
            clearInterval(nextUpdateTask)
          }

          nextUpdateTask = setTimeout(() => {
            if (!updating) {
              updating = true
              updateRequest(getUpdateCallback(runRequestTime))
            }
          }, timeToRun)
        }
      }

      const getUpdateCallback = runRequestTime => {
        lastUpdateTime = new Date()
        updating = false

        if (lastUpdateRequestTime > runRequestTime) {
          tryRun(lastUpdateRequestTime)
        }
      }

      let requestTime = lastUpdateRequestTime
      if (!updating) {
        tryRun(requestTime)
      }
    }
  }
})()

export const storageMiddleware = store => next => action => {
  const state = store.getState()
  const storage = state.storage

  if (action.type === 'SET_DIAGRAM_NAME') {
    if (storage.store === "googleDrive") {
      renameGoogleDriveStore(storage.fileId, action.diagramName)
    }
  }
  if (action.category === 'GRAPH') {

    switch (storage.store) {
      case "googleDrive":
        const result = next(action)
        const newState = store.getState()
        limitedUpdater.updateRequested(callback => updateGoogleDriveStore(newState, store.dispatch, storage.fileName, false, callback))
        return result
      case "neo4j":
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
