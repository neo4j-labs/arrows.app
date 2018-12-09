import {Size} from "../model/Size";
import gangsSelector from '../selectors/gang'

const gangsLayer = {
  name: 'gangs',
  selector: gangsSelector
}

const applicationLayout = (state = {
  windowSize: new Size(window.innerWidth, window.innerHeight),
  inspectorVisible: true,
  layers: [gangsLayer]
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