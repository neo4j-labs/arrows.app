import {Size} from "../model/Size";
import gangsSelector, {selectorForInspection} from '../selectors/gang'
import { mouseMove, mouseUp } from "../actions/gang";

const gangsLayer = {
  name: 'gangs',
  persist: false,
  selector: gangsSelector,
  selectorForInspection,
  eventHandlers: {
    mouseMove,
    mouseUp
  }
}

const applicationLayout = (state = {
  windowSize: new Size(window.innerWidth, window.innerHeight),
  inspectorVisible: true,
  betaFeaturesEnabled: false,
  layers: []
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

    case 'SET_BETA_FEATURES_ENABLED':
      return {
        ...state,
        layers: action.enabled ? [gangsLayer] : [],
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