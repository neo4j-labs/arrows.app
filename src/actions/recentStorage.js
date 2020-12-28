export const updateRecentStorage = (mode, fileId) => {
  return {
    type: 'UPDATE_RECENT_STORAGE',
    mode,
    fileId,
    timestamp: Date.now()
  }
}