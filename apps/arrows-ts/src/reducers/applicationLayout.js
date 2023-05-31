import {Size} from "../model-old/Size";

const applicationLayout = (state = {
  windowSize: new Size(window.innerWidth, window.innerHeight),
  inspectorVisible: true,
  styleMode: 'theme',
  betaFeaturesEnabled: false,
  layers: []
}, action) => {
  switch (action.type) {
    case 'WINDOW_RESIZED':
      return {
        ...state,
        windowSize: new Size(action.width, action.height)
      }

    case 'TOGGLE_INSPECTOR':
      return {
        ...state,
        inspectorVisible: !state.inspectorVisible
      }

    case 'STYLE_THEME':
      return {
        ...state,
        styleMode: 'theme'
      }

    case 'STYLE_CUSTOMIZE':
      return {
        ...state,
        styleMode: 'customize'
      }

    case 'SET_BETA_FEATURES_ENABLED':
      return {
        ...state,
        layers: [],
        betaFeaturesEnabled: action.enabled
      }
    case 'SET_PERSIST_CLUSTERS':
      const clusterLayer = state.layers.find(layer => layer.name === 'gangs')
      if (clusterLayer && clusterLayer.persist !== action.enabled) {
        const otherLayers = state.layers.filter(layer => layer.name !== 'gangs')
        return {
          ...state,
          layers: otherLayers.concat([{
            ...clusterLayer,
            persist: action.enabled
          }])
        }
      } else {
        return state
      }
    default:
      return state
  }
}

export default applicationLayout
