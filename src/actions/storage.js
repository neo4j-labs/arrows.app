

export function setStorage(store, fileId) {
  return {
    type: 'SET_STORE_TYPE',
    store,
    fileId
  }
}