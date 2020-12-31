export const importJsonRegex = /^#\/import\/json=(.*)/
export const localUrlNoIdRegex = /^#\/local$/
export const localUrlRegex = /^#\/local\/id=(.*)/
export const googleDriveUrlRegex = /^#\/googledrive\/ids=(.*)/

export const windowLocationHashMiddleware = store => next => action => {
  const result = next(action)
  const newState = store.getState()
  const storage = newState.storage

  switch (storage.mode) {
    case 'GOOGLE_DRIVE':
      if (storage.fileId) {
        window.location.hash = `#/googledrive/ids=${storage.fileId}`
      }
      break
    case 'DATABASE':
      window.location.hash = `#/neo4j`
      break
    case 'LOCAL_STORAGE':
      window.location.hash = `#/local/id=${storage.fileId}`
      break
  }

  return result
}