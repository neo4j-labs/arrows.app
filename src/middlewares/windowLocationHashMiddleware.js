export const importJsonRegex = /^#\/import\/json=(.*)/
export const localUrlNoIdRegex = /^#\/local$/
export const localUrlRegex = /^#\/local\/id=(.*)/
export const googleDriveUrlRegex = /^#\/googledrive\/ids=(.*)/

export const windowLocationHashMiddleware = store => next => action => {
  const oldStorage = store.getState().storage
  const result = next(action)
  const newStorage = store.getState().storage

  if (oldStorage !== newStorage) {
    switch (newStorage.mode) {
      case 'GOOGLE_DRIVE':
        if (newStorage.fileId) {
          window.location.hash = `#/googledrive/ids=${newStorage.fileId}`
        }
        break
      case 'DATABASE':
        window.location.hash = `#/neo4j`
        break
      case 'LOCAL_STORAGE':
        window.location.hash = `#/local/id=${newStorage.fileId}`
        break
    }
  }

  return result
}