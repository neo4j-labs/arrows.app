import {Size} from "../model/Size";
import gangsSelector, { getGangs, selectorForInspection } from '../selectors/gang'
import { mouseMove, mouseUp } from "../actions/gang";
import { writeQueriesForAction as clusterWriteQueryAction } from "../storage/clusterCypherQueries"

const gangsLayer = {
  name: 'gangs',
  persist: true,
  selector: gangsSelector,
  selectorForInspection,
  eventHandlers: {
    mouseMove,
    mouseUp
  },
  storageActionHandler: {
    neo4j: clusterWriteQueryAction,
    googleDrive: getGangs,
    localStorage: getGangs
  },
}

const applicationLayout = (state = {
  windowSize: new Size(window.innerWidth, window.innerHeight),
  inspectorVisible: true,
  betaFeaturesEnabled: true,
  layers: [gangsLayer]
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
