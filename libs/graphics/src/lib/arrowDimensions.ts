import { Graph, getStyleSelector } from '@neo4j-arrows/model';
import { adaptForBackground } from './backgroundColorAdaption';
import { selectionBorder, Cardinality } from '@neo4j-arrows/model';
import { ResolvedRelationship } from './ResolvedRelationship';
import { VisualNode } from './VisualNode';

export interface ArrowDimensions {
  startRadius?: number;
  endRadius?: number;
  arrowWidth: any;
  arrowColor: any;
  selectionColor?: any;
  hasArrowHead: boolean;
  headWidth: number;
  headHeight: number;
  chinHeight: number;
  separation?: any;
  leftToRight?: boolean;
}

export const relationshipArrowDimensions = (
  resolvedRelationship: ResolvedRelationship,
  graph: Graph,
  leftNode: VisualNode
): ArrowDimensions => {
  const style = (styleKey: string) =>
    getStyleSelector(resolvedRelationship.relationship, styleKey)(graph);
  const startRadius = resolvedRelationship.from.radius + style('margin-start');
  const endRadius = resolvedRelationship.to.radius + style('margin-end');
  const arrowWidth = style('arrow-width');
  const arrowColor = style('arrow-color');
  const selectionColor = adaptForBackground(selectionBorder, style);

  let hasArrowHead = false;
  let headWidth = 0;
  let headHeight = 0;
  let chinHeight = 0;

  const cardinality = resolvedRelationship.relationship.cardinality;
  if (cardinality !== Cardinality.MANY_TO_MANY) {
    hasArrowHead = true;
    headWidth = arrowWidth + 6 * Math.sqrt(arrowWidth);
    headHeight = headWidth * 1.5;
    chinHeight = headHeight / 10;
  }

  const separation = style('margin-peer');
  const leftToRight = resolvedRelationship.from === leftNode;

  return {
    startRadius,
    endRadius,
    arrowWidth,
    arrowColor,
    selectionColor,
    hasArrowHead,
    headWidth,
    headHeight,
    chinHeight,
    separation,
    leftToRight,
  };
};
