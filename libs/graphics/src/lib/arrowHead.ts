import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { DrawingContext } from './utils/DrawingContext';

// creates a polygon for an arrow head facing right, with its point at the origin.
export default function arrowHead(
  ctx: DrawingContext,
  headHeight: number,
  chinHeight: number,
  headWidth: number,
  fill: boolean,
  stroke: boolean
) {
  ctx.polygon(
    [
      { x: chinHeight - headHeight, y: 0 },
      { x: -headHeight, y: headWidth / 2 },
      { x: 0, y: 0 },
      { x: -headHeight, y: -headWidth / 2 },
    ],
    fill,
    stroke
  );
}
