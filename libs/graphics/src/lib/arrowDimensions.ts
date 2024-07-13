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
  hasOutgoingArrowHead: boolean;
  hasIngoingArrowHead: boolean;
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

  const headWidth = arrowWidth + 6 * Math.sqrt(arrowWidth);
  const headHeight = headWidth * 1.5;
  const chinHeight = headHeight / 10;

  const cardinality = resolvedRelationship.relationship.cardinality;
  const hasIngoingArrowHead =
    cardinality === Cardinality.MANY_TO_ONE ||
    cardinality === Cardinality.ONE_TO_ONE;
  const hasOutgoingArrowHead =
    cardinality === Cardinality.ONE_TO_MANY ||
    cardinality === Cardinality.ONE_TO_ONE;

  const separation = style('margin-peer');
  const leftToRight = resolvedRelationship.from === leftNode;

  return {
    startRadius,
    endRadius,
    arrowWidth,
    arrowColor,
    selectionColor,
    hasOutgoingArrowHead,
    hasIngoingArrowHead,
    headWidth,
    headHeight,
    chinHeight,
    separation,
    leftToRight,
  };
};
