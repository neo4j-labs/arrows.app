import { Point } from '@neo4j-arrows/model';
import { Vector } from '@neo4j-arrows/model';
import { getDistanceToLine } from './utils/geometryUtils';
import arrowHead from './arrowHead';
import { ArrowDimensions } from './arrowDimensions';
import { DrawingContext } from './utils/DrawingContext';

export class ParallelArrow {
  centreDistance: number;
  displacement: number;
  startCentre: Point;
  endCentre: Point;
  startRadius: number;
  endRadius: number;
  angle: number;
  midShaft: number;
  arcRadius: number;
  dimensions: ArrowDimensions;
  startAttach: Point;
  startShaft: Point;
  endDeflection: number;
  endAttach: Point;
  startControl: number;
  endControl: number;
  endShaft: Point;
  drawArcs: boolean;

  constructor(
    startCentre: Point,
    endCentre: Point,
    startRadius: number,
    endRadius: number,
    startDeflection: number,
    endDeflection: number,
    displacement: number,
    arcRadius: number,
    dimensions: ArrowDimensions
  ) {
    const interNodeVector = endCentre.vectorFrom(startCentre);
    this.centreDistance = interNodeVector.distance();

    this.displacement = displacement;
    this.startCentre = startCentre;
    this.endCentre = endCentre;
    this.startRadius = startRadius;
    this.endRadius = endRadius;
    this.angle = interNodeVector.angle();
    this.midShaft = this.centreDistance / 2;
    this.arcRadius = arcRadius;
    this.dimensions = dimensions;

    this.startAttach = new Point(startRadius, 0).rotate(startDeflection);
    this.startShaft = new Point(
      startRadius +
        (dimensions.hasIngoingArrowHead
          ? dimensions.headHeight - dimensions.chinHeight
          : 0),
      0
    ).rotate(endDeflection);
    this.endDeflection = endDeflection;
    this.endAttach = new Point(-endRadius, 0)
      .rotate(-endDeflection)
      .translate(new Vector(this.centreDistance, 0));

    this.startControl =
      (this.startAttach.x * displacement) / this.startAttach.y;
    this.endControl =
      this.centreDistance -
      ((this.centreDistance - this.endAttach.x) * displacement) /
        this.endAttach.y;
    this.endShaft = new Point(
      -(
        endRadius +
        (dimensions.hasOutgoingArrowHead
          ? dimensions.headHeight - dimensions.chinHeight
          : 0)
      ),
      0
    )
      .rotate(-endDeflection)
      .translate(new Vector(this.centreDistance, 0));

    const endArcHeight =
      arcRadius - arcRadius * Math.cos(Math.abs(endDeflection));
    this.drawArcs =
      this.midShaft - this.startControl >
        this.arcRadius * Math.tan(Math.abs(startDeflection) / 2) &&
      this.endControl - this.midShaft >
        this.arcRadius * Math.tan(Math.abs(endDeflection) / 2) &&
      (displacement < 0
        ? this.endShaft.y - endArcHeight > displacement
        : this.endShaft.y + endArcHeight < displacement);
  }

  distanceFrom(point: Point) {
    const [startPoint, endPoint] = (
      this.drawArcs
        ? [
            new Point(this.startControl, this.displacement),
            new Point(this.endControl, this.displacement),
          ]
        : [this.startAttach, this.endAttach]
    ).map((point) =>
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
      const [x, y] = this.startAttach.xy;
      ctx.translate(x, y);
      ctx.rotate(Math.PI + this.endDeflection);
      ctx.fillStyle = this.dimensions.arrowColor;
      arrowHead(
        ctx,
        this.dimensions.headHeight,
        this.dimensions.chinHeight,
        this.dimensions.headWidth,
        true,
        false
      );
      ctx.rotate(Math.PI - this.endDeflection);
      ctx.translate(-x, -y);
    }
    ctx.beginPath();
    this.path(ctx);
    ctx.lineWidth = this.dimensions.arrowWidth;
    ctx.strokeStyle = this.dimensions.arrowColor;
    ctx.stroke();
    if (this.dimensions.hasOutgoingArrowHead) {
      ctx.translate(this.centreDistance, 0);
      ctx.rotate(-this.endDeflection);
      ctx.translate(-this.endRadius, 0);
      ctx.fillStyle = this.dimensions.arrowColor;
      arrowHead(
        ctx,
        this.dimensions.headHeight,
        this.dimensions.chinHeight,
        this.dimensions.headWidth,
        true,
        false
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
    if (this.dimensions.hasIngoingArrowHead) {
      const [x, y] = this.startAttach.xy;
      ctx.translate(x, y);
      ctx.rotate(Math.PI + this.endDeflection);
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
      ctx.rotate(Math.PI - this.endDeflection);
      ctx.translate(-x, -y);
    }
    ctx.beginPath();
    this.path(ctx);
    ctx.lineWidth = this.dimensions.arrowWidth + indicatorWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    if (this.dimensions.hasOutgoingArrowHead) {
      ctx.translate(this.centreDistance, 0);
      ctx.rotate(-this.endDeflection);
      ctx.translate(-this.endRadius, 0);
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
      ctx.stroke();
    }
    ctx.restore();
  }

  path(ctx: DrawingContext) {
    ctx.moveTo(this.startShaft.x, this.startShaft.y);
    ctx.arcTo(
      this.startControl,
      this.displacement,
      this.midShaft,
      this.displacement,
      this.arcRadius
    );
    ctx.arcTo(
      this.endControl,
      this.displacement,
      this.endShaft.x,
      this.endShaft.y,
      this.arcRadius
    );
    ctx.lineTo(this.endShaft.x, this.endShaft.y);
  }

  midPoint() {
    return new Point(
      (this.centreDistance + this.startRadius - this.endRadius) / 2,
      this.displacement
    )
      .rotate(this.angle)
      .translate(this.startCentre.vectorFromOrigin());
  }

  shaftAngle() {
    return this.angle;
  }

  get arrowKind() {
    return 'straight';
  }
}
