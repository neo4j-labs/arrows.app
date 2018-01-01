import {Size} from "../model/Size";

const windowSize = (state = new Size(window.innerWidth, window.innerHeight), action) => {
  switch (action.type) {
    case 'WINDOW_RESIZED':
      return new Size(action.width, action.height)

    default:
      return state
  }
}

export default windowSize