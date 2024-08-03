import { getDistanceToLine } from './utils/geometryUtils';
import arrowHead from './arrowHead';
import { Point, Vector } from '@neo4j-arrows/model';
import { normaliseAngle } from './utils/angles';
import { ArrowDimensions } from './arrowDimensions';
import { DrawingContext } from './utils/DrawingContext';

export class StraightArrow {
  readonly startCentre: Point;
  readonly endCentre: Point;
  readonly angle: number;
  readonly dimensions: ArrowDimensions;
  readonly startAttach: Point;
  readonly startShaft: Point;
  readonly endAttach: Point;
  readonly endShaft: Point;

  constructor(
    startCentre: Point,
    endCentre: Point,
    startAttach: Point,
    endAttach: Point,
    dimensions: ArrowDimensions
  ) {
    const interNodeVector = endCentre.vectorFrom(startCentre);
    const arrowVector = endAttach.vectorFrom(startAttach);
    const headsHeight =
      (dimensions.headHeight - dimensions.chinHeight) *
      (+dimensions.hasIngoingArrowHead + +dimensions.hasOutgoingArrowHead);
    const factor =
      (arrowVector.distance() - headsHeight) / arrowVector.distance();

    this.startCentre = startCentre;
    this.endCentre = endCentre;
    this.angle = interNodeVector.angle();
    this.dimensions = dimensions;
    this.startAttach = startAttach;
    this.startShaft = startAttach;
    if (dimensions.hasIngoingArrowHead) {
      this.startShaft = this.startShaft.translate(
        new Vector(dimensions.headHeight - dimensions.chinHeight, 0)
      );
    }
    this.endAttach = endAttach;
    this.endShaft = this.startShaft.translate(arrowVector.scale(factor));
  }

  distanceFrom(point: Point) {
    const [startPoint, endPoint] = [this.startAttach, this.endAttach].map(
      (point) =>
        point.rotate(this.angle).translate(this.startCentre.vectorFromOrigin())
    );
    return getDistanceToLine(
      startPoint.x,
      startPoint.y,
      endPoint.x,
      endPoint.y,
      point.x,
      point.y
    );
  }

  draw(ctx: DrawingContext) {
    ctx.save();
    ctx.translate(this.startCentre.x, this.startCentre.y);
    ctx.rotate(this.angle);
    if (this.dimensions.hasIngoingArrowHead) {
      ctx.translate(this.startAttach.x, 0);
      ctx.rotate(this.startAttach.vectorFrom(this.endAttach).angle());
      ctx.lineWidth = this.dimensions.arrowHeadsWidth;
      ctx.fillStyle = this.dimensions.arrowColor;
      arrowHead(
        ctx,
        this.dimensions.headHeight,
        this.dimensions.chinHeight,
        this.dimensions.headWidth,
        this.dimensions.fillArrowHeads,
        !this.dimensions.fillArrowHeads
      );
      ctx.rotate(Math.PI - this.endAttach.vectorFrom(this.startAttach).angle());
      ctx.translate(-this.startAttach.x, 0);
    }
    ctx.beginPath();
    ctx.moveTo(this.startShaft.x, this.startShaft.y);
    ctx.lineTo(this.endShaft.x, this.endShaft.y);
    ctx.lineWidth = this.dimensions.shaftWidth;
    ctx.strokeStyle = this.dimensions.arrowColor;
    ctx.stroke();
    if (this.dimensions.hasOutgoingArrowHead) {
      ctx.translate(this.endAttach.x, this.endAttach.y);
      ctx.rotate(this.endAttach.vectorFrom(this.startAttach).angle());
      ctx.lineWidth = this.dimensions.arrowHeadsWidth;
      ctx.fillStyle = this.dimensions.arrowColor;
      arrowHead(
        ctx,
        this.dimensions.headHeight,
        this.dimensions.chinHeight,
        this.dimensions.headWidth,
        this.dimensions.fillArrowHeads,
        !this.dimensions.fillArrowHeads
      );
    }
    ctx.restore();
  }

  drawSelectionIndicator(ctx: DrawingContext) {
    const indicatorWidth = 10;
    ctx.save();
    ctx.translate(this.startCentre.x, this.startCentre.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = this.dimensions.selectionColor;
    ctx.lineJoin = 'round';
    if (this.dimensions.hasIngoingArrowHead) {
      ctx.translate(this.startAttach.x, 0);
      ctx.rotate(this.startAttach.vectorFrom(this.endAttach).angle());
      ctx.lineWidth = indicatorWidth;
      arrowHead(
        ctx,
        this.dimensions.headHeight,
        this.dimensions.chinHeight,
        this.dimensions.headWidth,
        false,
        true
      );
      ctx.rotate(Math.PI - this.endAttach.vectorFrom(this.startAttach).angle());
      ctx.translate(-this.startAttach.x, 0);
    }
    ctx.beginPath();
    ctx.moveTo(this.startShaft.x, this.startShaft.y);
    ctx.lineTo(this.endShaft.x, this.endShaft.y);
    ctx.lineWidth = this.dimensions.shaftWidth + indicatorWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    if (this.dimensions.hasOutgoingArrowHead) {
      ctx.translate(this.endAttach.x, this.endAttach.y);
      ctx.rotate(this.endAttach.vectorFrom(this.startAttach).angle());
      ctx.lineWidth = indicatorWidth;
      ctx.lineJoin = 'round';
      arrowHead(
        ctx,
        this.dimensions.headHeight,
        this.dimensions.chinHeight,
        this.dimensions.headWidth,
        false,
        true
      );
    }
    ctx.restore();
  }

  midPoint() {
    return this.startShaft
      .translate(this.endShaft.vectorFrom(this.startShaft).scale(0.5))
      .rotate(this.angle)
      .translate(this.startCentre.vectorFromOrigin());
  }

  shaftAngle() {
    return normaliseAngle(
      this.angle + this.endAttach.vectorFrom(this.startAttach).angle()
    );
  }

  get arrowKind() {
    return 'straight';
  }
}

export const normalStraightArrow = (
  startCentre: Point,
  endCentre: Point,
  startRadius: number,
  endRadius: number,
  dimensions: ArrowDimensions
) => {
  const interNodeVector = endCentre.vectorFrom(startCentre);
  const startAttach = new Point(startRadius, 0);
  const endAttach = new Point(interNodeVector.distance() - endRadius, 0);
  return new StraightArrow(
    startCentre,
    endCentre,
    startAttach,
    endAttach,
    dimensions
  );
};
