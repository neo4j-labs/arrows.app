import {updateRecentStorage} from "../actions/recentStorage";
import {saveRecentlyAccessedDiagrams} from "../actions/localStorage";

export const recentStorageMiddleware = store => next => action => {

  const oldState = store.getState()
  const oldStorage = oldState.storage
  const result = next(action)
  const newState = store.getState()
  const newStorage = newState.storage

  if (!(
    oldStorage.mode === newStorage.mode &&
    oldStorage.fileId === newStorage.fileId &&
    oldState.diagramName === newState.diagramName
  )) {
    store.dispatch(updateRecentStorage(newStorage.mode, newStorage.fileId, newState.diagramName))
  }

  if (action.type === 'UPDATE_RECENT_STORAGE') {
    saveRecentlyAccessedDiagrams(newState.recentStorage)
  }

  return result
}
