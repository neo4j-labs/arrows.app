export const windowResized = (width, height) => {
  return {
    type: 'WINDOW_RESIZED',
    width,
    height
  }
}

export const toggleInspector = () => {
  return {
    type: 'TOGGLE_INSPECTOR'
  }
}

export const setBetaFeaturesEnabled = enabled => ({
  type: 'SET_BETA_FEATURES_ENABLED',
  enabled
})

export const setPersistClusters = enabled => ({
  type: 'SET_PERSIST_CLUSTERS',
  enabled
})