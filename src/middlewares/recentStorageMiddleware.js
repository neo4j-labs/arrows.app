import {updateRecentStorage} from "../actions/recentStorage";

export const recentStorageMiddleware = store => next => action => {

  const oldStorage = store.getState().storage
  const result = next(action)
  const newStorage = store.getState().storage

  if (!(oldStorage.mode === newStorage.mode && oldStorage.fileId === newStorage.fileId)) {
    store.dispatch(updateRecentStorage(newStorage.mode, newStorage.fileId))
  }
  return result
}
