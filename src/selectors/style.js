import {createSelector} from "reselect";

const graphStyleSelector = graph => graph.style || {}

export const getStyleSelector = (entity, styleKey) =>
  createSelector(
    graphStyleSelector,
    // graphStyle => entity.style && entity.style.hasOwnProperty(styleKey) || graphStyle[styleKey]
    graphStyle => {
      if (entity.style && entity.style.hasOwnProperty(styleKey)) {
        return entity.style[styleKey]
      }
      return graphStyle[styleKey]
    }
  )