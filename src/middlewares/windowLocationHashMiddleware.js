export const windowLocationHashMiddleware = store => next => action => {
  const result = next(action)
  const newState = store.getState()
  const storage = newState.storage

  switch (storage.store) {
    case "GOOGLE_DRIVE":
      window.location.hash = `#/googledrive/ids=${storage.fileId}`
      break
    case "NEO4J":
      window.location.hash = `#/neo4j`
      break
  }

  return result
}