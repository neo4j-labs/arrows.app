import {getStyleSelector} from "../selectors/style";

export const relationshipArrowDimensions = (resolvedRelationship, graph, leftNode) => {
  const style = styleKey => getStyleSelector(resolvedRelationship.relationship, styleKey)(graph)
  const startRadius = resolvedRelationship.from.radius + style('margin-start')
  const endRadius = resolvedRelationship.to.radius + style('margin-end')
  const arrowWidth = style('arrow-width')
  const arrowColor = style('arrow-color')
  const headWidth = arrowWidth + 6 * Math.sqrt(arrowWidth)
  const headHeight = headWidth * 1.5
  const chinHeight = headHeight / 10
  const separation = style('margin-peer')
  const leftToRight = resolvedRelationship.from === leftNode
  return { startRadius, endRadius, arrowWidth, arrowColor, headWidth, headHeight, chinHeight, separation, leftToRight }
};
