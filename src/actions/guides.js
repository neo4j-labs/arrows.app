const placeGuides = (guidelines, naturalPosition) => {
  return {
    type: 'PLACE_GUIDES',
    guidelines,
    naturalPosition
  }
}

export default placeGuides