import {ViewTransformation} from "../state/ViewTransformation";

const viewTransformation = (state = new ViewTransformation(), action) => {
  switch (action.type) {
    case 'SCROLL':
      return state.scroll(action.vector)

    case 'ADJUST_VIEWPORT':
      return state.adjust(action.scale, action.panX, action.panY)
    default:
      return state
  }
}

export default viewTransformation