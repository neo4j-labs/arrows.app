export default function exporting(state = {
  showExportDialog: false
}, action) {
  switch (action.type) {
    case 'SHOW_EXPORT_DIALOG':
      return {
        ...state,
        showExportDialog: true
      }

    case 'HIDE_EXPORT_DIALOG':
      return {
        ...state,
        showExportDialog: false
      }

    default:
      return state
  }

}