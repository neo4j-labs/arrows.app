export const windowLocationHashMiddleware = store => next => action => {
  const result = next(action)
  const newState = store.getState()
  const storage = newState.storage

  switch (storage.mode) {
    case 'GOOGLE_DRIVE':
      if (storage.googleDrive.fileId) {
        window.location.hash = `#/googledrive/ids=${storage.googleDrive.fileId}`
      }
      break
    case 'DATABASE':
      window.location.hash = `#/neo4j`
      break
    case 'LOCAL_STORAGE':
      window.location.hash = `#/local`
      break
  }

  return result
}