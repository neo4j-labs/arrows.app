import { BoundingBox } from './utils/BoundingBox';
import { Point } from '@neo4j-arrows/model';
import { DrawingContext } from './utils/DrawingContext';

export interface DrawableComponent {
  type: string;
  contentsFit?: boolean;
  height: number;
  width: number;
  margin?: number;
  draw: (ctx: DrawingContext) => void;
  drawSelectionIndicator?: (ctx: DrawingContext) => void;
  boundingBox: () => BoundingBox;
  distanceFrom: (p: Point) => number;
}
