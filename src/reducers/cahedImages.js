export default function cachedImages(state = {}, action) {
  if (action.type === 'IMAGE_EVENT') {
    return {
      ...state,
      [action.imageUrl]: action.cachedImage
    }
  }

  return state
}
