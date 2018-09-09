

export function setStorage(store, fileId, fileName) {
  return {
    type: 'SET_STORE_TYPE',
    store,
    fileId,
    fileName
  }
}

export function setFileMetadata(fileName) {
  return {
    type: 'SET_FILE_METADATA',
    fileName
  }
}