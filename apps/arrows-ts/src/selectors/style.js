import {createSelector} from "reselect";
import {validate} from "../model-old/styling";

const graphStyleSelector = graph => graph.style || {}

const specificOrGeneral = (styleKey, entity, graphStyle) => {
  if (entity.style && entity.style.hasOwnProperty(styleKey)) {
    return entity.style[styleKey]
  }
  return graphStyle[styleKey]
}

export const getStyleSelector = (entity, styleKey) =>
  createSelector(
    graphStyleSelector,
    graphStyle => validate(styleKey, specificOrGeneral(styleKey, entity, graphStyle))
  )