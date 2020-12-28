export default function recentStorage(state = [], action) {
  if (action.type === 'UPDATE_RECENT_STORAGE') {
    const { mode, fileId, timestamp } = action
    return [{ mode, fileId, timestamp }, ...state.filter(entry =>
      !(entry.mode === mode && entry.fileId === fileId)
    )]
  }

  return state
}