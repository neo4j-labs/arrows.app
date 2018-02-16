export const placeGuides = (guidelines, naturalPosition) => {
  return {
    type: 'PLACE_GUIDES',
    guidelines,
    naturalPosition
  }
}

export const clearGuides = () => {
  return {
    type: 'CLEAR_GUIDES'
  }
}