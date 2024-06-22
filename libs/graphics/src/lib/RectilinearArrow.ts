import arrowHead from './arrowHead';
import { Vector, Point } from '@neo4j-arrows/model';
import { SeekAndDestroy } from './SeekAndDestroy';
import { normaliseAngle } from './utils/angles';
import { ArrowDimensions } from './arrowDimensions';
import { VisualAttachment } from './VisualAttachment';
import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { DrawingContext } from './utils/DrawingContext';

export class RectilinearArrow {
  dimensions: ArrowDimensions;
  endShaft: Point;
  shaft: SeekAndDestroy;
  path: any;
  midShaft: any;
  midShaftAngle: any;

  constructor(
    startCentre: Point,
    endCentre: Point,
    startRadius: number,
    endRadius: number,
    startAttachment: VisualAttachment,
    endAttachment: VisualAttachment,
    dimensions: ArrowDimensions
  ) {
    this.dimensions = dimensions;
    const arcRadius =
      startAttachment.total > endAttachment.total
        ? computeArcRadius(startAttachment)
        : computeArcRadius(endAttachment);
    const startAttachAngle = startAttachment.attachment.angle;
    const endAttachAngle = endAttachment.attachment.angle;
    const startOffset =
      (startAttachment.ordinal - (startAttachment.total - 1) / 2) * 10;
    const endOffset =
      (endAttachment.ordinal - (endAttachment.total - 1) / 2) * 10;
    const endShaftRadius =
      endRadius + this.dimensions.headHeight - this.dimensions.chinHeight;
    const startAttach = startCentre.translate(
      new Vector(startRadius, startOffset).rotate(startAttachAngle)
    );
    const endAttach = endCentre.translate(
      new Vector(endRadius, endOffset).rotate(endAttachAngle)
    );
    this.endShaft = endCentre.translate(
      new Vector(endShaftRadius, endOffset).rotate(endAttachAngle)
    );
    const startNormalDistance = arcRadius + startAttachment.minNormalDistance;
    const endNormalDistance =
      arcRadius +
      endAttachment.minNormalDistance -
      (this.dimensions.headHeight - this.dimensions.chinHeight);

    const fanOut = startAttachment.total > endAttachment.total;

    this.shaft = new SeekAndDestroy(
      startAttach,
      startAttachAngle,
      this.endShaft,
      normaliseAngle(endAttachAngle + Math.PI)
    );
    let longestSegmentIndex;

    const initialAngle = Math.abs(
      Math.round((this.shaft.endDirectionRelative * 180) / Math.PI)
    );
    switch (initialAngle) {
      case 0:
        if (this.shaft.endRelative.x > 0) {
          if (this.shaft.endRelative.y === 0) {
            longestSegmentIndex = 0;
          } else {
            const distance =
              this.shaft.endRelative.x < arcRadius * 2
                ? this.shaft.endRelative.x / 2
                : fanOut
                ? startNormalDistance
                : this.shaft.endRelative.x - endNormalDistance;
            this.shaft.forwardToWaypoint(
              distance,
              this.shaft.rightAngleTowardsEnd,
              arcRadius
            );
            this.shaft.forwardToWaypoint(
              this.shaft.endRelative.x,
              this.shaft.rightAngleTowardsEnd,
              arcRadius
            );

            longestSegmentIndex = fanOut ? 2 : 0;
          }
        } else {
          this.shaft.forwardToWaypoint(
            startNormalDistance,
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );
          const distance = Math.max(
            startNormalDistance + startRadius,
            this.shaft.endRelative.x + endRadius + arcRadius
          );
          this.shaft.forwardToWaypoint(
            distance,
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );
          this.shaft.forwardToWaypoint(
            this.shaft.endRelative.x + endNormalDistance,
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );
          this.shaft.forwardToWaypoint(
            this.shaft.endRelative.x,
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );

          longestSegmentIndex = 2;
        }
        break;

      case 90:
        if (this.shaft.endRelative.x > 0) {
          if (this.shaft.endDirectionRelative * this.shaft.endRelative.y < 0) {
            this.shaft.forwardToWaypoint(
              this.shaft.endRelative.x - endRadius - arcRadius,
              this.shaft.rightAngleTowardsEnd,
              arcRadius
            );
            this.shaft.forwardToWaypoint(
              this.shaft.endRelative.x + arcRadius,
              this.shaft.rightAngleTowardsEnd,
              arcRadius
            );
          }
          this.shaft.forwardToWaypoint(
            this.shaft.endRelative.x,
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );
          longestSegmentIndex = 0;
        } else {
          longestSegmentIndex =
            Math.abs(this.shaft.endRelative.x) >
            Math.abs(this.shaft.endRelative.y)
              ? 1
              : 2;

          this.shaft.forwardToWaypoint(
            Math.max(
              startNormalDistance,
              arcRadius * 2 + this.shaft.endRelative.x
            ),
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );
          this.shaft.forwardToWaypoint(
            Math.max(this.shaft.endRelative.x + arcRadius, arcRadius * 2),
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );
          this.shaft.forwardToWaypoint(
            this.shaft.endRelative.x,
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );
        }
        break;

      default:
        if (Math.abs(this.shaft.endRelative.y) > arcRadius * 2) {
          const distance = Math.max(
            arcRadius,
            this.shaft.endRelative.x + arcRadius
          );
          this.shaft.forwardToWaypoint(
            distance,
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );
          this.shaft.forwardToWaypoint(
            this.shaft.endRelative.x,
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );

          longestSegmentIndex = 1;
        } else {
          this.shaft.forwardToWaypoint(
            arcRadius,
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );
          this.shaft.forwardToWaypoint(
            arcRadius + startRadius,
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );
          this.shaft.forwardToWaypoint(
            this.shaft.endRelative.x - arcRadius,
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );
          this.shaft.forwardToWaypoint(
            this.shaft.endRelative.x,
            this.shaft.rightAngleTowardsEnd,
            arcRadius
          );

          longestSegmentIndex = 3;
        }
    }

    this.path = this.shaft.changeEnd(endAttach);

    const longestSegment = this.shaft.segment(longestSegmentIndex);
    this.midShaft = longestSegment.from.translate(
      longestSegment.to.vectorFrom(longestSegment.from).scale(0.5)
    );
    this.midShaftAngle = longestSegment.from
      .vectorFrom(longestSegment.to)
      .angle();
  }

  distanceFrom(point: Point) {
    return this.path.distanceFrom(point);
  }

  draw(ctx: DrawingContext) {
    ctx.save();
    ctx.beginPath();
    this.shaft.draw(ctx);
    ctx.lineWidth = this.dimensions.arrowWidth;
    ctx.strokeStyle = this.dimensions.arrowColor;
    ctx.stroke();
    if (this.dimensions.hasArrowHead) {
      ctx.translate(...this.endShaft.xy);
      ctx.rotate(this.shaft.endDirection);
      ctx.translate(this.dimensions.headHeight - this.dimensions.chinHeight, 0);
      ctx.fillStyle = this.dimensions.arrowColor;
      arrowHead(
        ctx,
        this.dimensions.headHeight,
        this.dimensions.chinHeight,
        this.dimensions.headWidth,
        true,
        false
      );
      ctx.fill();
    }
    ctx.restore();
  }

  drawSelectionIndicator(ctx: DrawingContext) {
    const indicatorWidth = 10;
    ctx.save();
    ctx.beginPath();
    this.shaft.draw(ctx);
    ctx.lineWidth = this.dimensions.arrowWidth + indicatorWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = this.dimensions.selectionColor;
    ctx.stroke();
    if (this.dimensions.hasArrowHead) {
      ctx.translate(...this.endShaft.xy);
      ctx.rotate(this.shaft.endDirection);
      ctx.translate(this.dimensions.headHeight - this.dimensions.chinHeight, 0);
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

  midPoint() {
    return this.midShaft;
  }

  shaftAngle() {
    return this.midShaftAngle;
  }

  get arrowKind() {
    return 'straight';
  }
}

const computeArcRadius = (attachment: VisualAttachment) => {
  return 40 + attachment.radiusOrdinal * 10;
};
