import {Size} from "../model/Size";

const applicationLayout = (state = {
  windowSize: new Size(window.innerWidth, window.innerHeight),
  inspectorVisible: true
}, action) => {
  switch (action.type) {
    case 'WINDOW_RESIZED':
      return {
        ...state,
        windowSize: new Size(action.width, action.height)
      }

    case 'SHOW_INSPECTOR':
      return {
        ...state,
        inspectorVisible: true
      }

    case 'HIDE_INSPECTOR':
      return {
        ...state,
        inspectorVisible: false
      }

    default:
      return state
  }
}

export default applicationLayout