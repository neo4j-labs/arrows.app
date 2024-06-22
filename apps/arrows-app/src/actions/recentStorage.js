export const updateRecentStorage = (mode, fileId, diagramName) => {
  return {
    type: 'UPDATE_RECENT_STORAGE',
    mode,
    fileId,
    diagramName,
    timestamp: Date.now(),
  };
};
