import {retrieveHelpDismissed} from "../actions/localStorage";
export default function applicationDialogs(state = {
  showExportDialog: false,
  showImportDialog: false,
  showHelpDialog: !retrieveHelpDismissed()
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

    case 'SHOW_IMPORT_DIALOG':
      return {
        ...state,
        showImportDialog: true
      }

    case 'HIDE_IMPORT_DIALOG':
      return {
        ...state,
        showImportDialog: false
      }

    case 'SHOW_HELP_DIALOG':
      return {
        ...state,
        showHelpDialog: true
      }

    case 'HIDE_HELP_DIALOG':
      return {
        ...state,
        showHelpDialog: false
      }

    default:
      return state
  }

}