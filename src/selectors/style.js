import {createSelector} from "reselect";

const graphStyleSelector = graph => graph.style || {}

export const getStyleSelector = (entity, styleKey) =>
  createSelector(
    graphStyleSelector,
    graphStyle => entity.style && entity.style[styleKey] || graphStyle[styleKey]
  )