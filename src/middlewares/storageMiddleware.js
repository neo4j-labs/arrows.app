import { updateStore as updateNeoStore } from "../storage/neo4jStorage"
import { saveToStore as updateGoogleDriveStore } from "../actions/googleDrive";

const updateQueue = []

const driveUpdateInterval = 5000 // ms

const limitedUpdater = (() => {
  let lastUpdateTime = new Date()
  let lastUpdateRequest = null
  let lastUpdateRequestTime = null
  let updating = false
  let nextUpdate = null

  return {
    updateRequested: (updateRequest) => {
      lastUpdateRequestTime = new Date()
      console.log("lastUpdateRequestTime", lastUpdateRequestTime)
      if (updating) {
        lastUpdateRequest = updateRequest
        console.log("is updating", lastUpdateRequest)
      } else {
        let startTimestamp = lastUpdateRequestTime

        const updateCallback = () => {
          lastUpdateTime = new Date()
          console.log("update complete", lastUpdateTime)

          if (lastUpdateRequest && lastUpdateRequestTime > startTimestamp) {
            startTimestamp = new Date()
            console.log('UPDATE ON CALLBACK', lastUpdateRequestTime, startTimestamp)
            lastUpdateRequest(updateCallback)
          } else {
            lastUpdateRequest = null
            updating = false
            console.log("is updating to false")
          }
        }

        console.log("should update", lastUpdateRequestTime, lastUpdateTime, lastUpdateRequestTime - lastUpdateTime)
        if (lastUpdateRequestTime - lastUpdateTime >= driveUpdateInterval) {
          updating = true
          console.log("try update", lastUpdateRequestTime)
          updateRequest(updateCallback)
        } else {
          lastUpdateRequest = updateRequest
          const timeToRun = driveUpdateInterval - (lastUpdateRequestTime - lastUpdateTime)

          if (nextUpdate) {
            clearTimeout(nextUpdate)
          }

          nextUpdate = setTimeout(() => {
              if (lastUpdateRequestTime == startTimestamp) {
                lastUpdateRequest(updateCallback)
              }
            }, timeToRun
          )
        }
      }
    }
  }
})()

export const storageMiddleware = store => next => action => {
  if (action.category === 'GRAPH') {
    const state = store.getState()
    const storage = state.storage

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
