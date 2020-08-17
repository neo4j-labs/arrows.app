import {retrieveHelpDismissed} from "../actions/localStorage";
export default function applicationDialogs(state = {
  showStyleDialog: false,
  showExportDialog: false,
  showHelpDialog: !retrieveHelpDismissed()
}, action) {
  switch (action.type) {
    case 'SHOW_STYLE_DIALOG':
      return {
        ...state,
        showStyleDialog: true
      }

    case 'HIDE_STYLE_DIALOG':
      return {
        ...state,
        showStyleDialog: false
      }

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