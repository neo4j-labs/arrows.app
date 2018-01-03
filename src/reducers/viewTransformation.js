import {ViewTransformation} from "../state/ViewTransformation";

const viewTransformation = (state = new ViewTransformation(), action) => {
  switch (action.type) {
    case 'ZOOM':
      return state.zoom(action.scale)

    case 'PAN':
      return state.pan(action.offset)

    default:
      return state
  }
}

export default viewTransformation