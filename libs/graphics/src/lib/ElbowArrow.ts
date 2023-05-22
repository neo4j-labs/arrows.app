import arrowHead from "./arrowHead";
import {Point} from "@neo4j-arrows/model";
import {Vector} from "@neo4j-arrows/model";
import {SeekAndDestroy} from "./SeekAndDestroy";
import {normaliseAngle} from "./utils/angles";
import { ArrowDimensions } from "./arrowDimensions";
import { CanvasAdaptor } from "./utils/CanvasAdaptor";
import { VisualAttachment } from "./VisualAttachment";
import { DrawingContext } from "./utils/DrawingContext";

export class ElbowArrow {
  dimensions: ArrowDimensions;
  midShaft: Point;
  midShaftAngle: number;
  path: SeekAndDestroy;
  constructor(startCentre:Point, endCentre:Point, startRadius:number, endRadius:number, startAttachment:VisualAttachment, endAttachment:VisualAttachment, dimensions:ArrowDimensions) {
    this.dimensions = dimensions
    const fixedEnd = (startAttachment && startAttachment.attachment.name !== 'normal') ? 'start' : 'end'
    const fixedAttachment = fixedEnd === 'start' ? startAttachment : endAttachment
    const arcRadius = 40 + fixedAttachment.radiusOrdinal * 10
    const fixedCentre = fixedEnd === 'start' ? startCentre : endCentre
    const normalCentre = fixedEnd === 'end' ? startCentre : endCentre
    const fixedRadius = fixedEnd === 'start' ? startRadius : endRadius + dimensions.headHeight - dimensions.chinHeight
    const fixedDivergeRadius = fixedEnd === 'start' ? startRadius + startAttachment.minNormalDistance : endRadius + Math.max(endAttachment.minNormalDistance, dimensions.headHeight - dimensions.chinHeight)
    const normalRadius = fixedEnd === 'end' ? startRadius : endRadius + dimensions.headHeight - dimensions.chinHeight
    const fixedAttachAngle = fixedAttachment.attachment.angle
    const offset = (fixedAttachment.ordinal - (fixedAttachment.total - 1) / 2) * 10
    const fixedAttach = fixedCentre.translate(new Vector(fixedRadius, offset).rotate(fixedAttachAngle))
    const fixedDiverge = fixedCentre.translate(new Vector(fixedDivergeRadius, offset).rotate(fixedAttachAngle))
    const normalCentreRelative = normalCentre.translate(fixedDiverge.vectorFromOrigin().invert()).rotate(-fixedAttachAngle)
    const arcCentre = new Point(0, normalCentreRelative.y < 0 ? -arcRadius : arcRadius)
    const arcCentreVector = normalCentreRelative.vectorFrom(arcCentre)
    const gamma = Math.asin(arcRadius / arcCentreVector.distance())
    const theta = gamma + Math.abs(arcCentreVector.angle())
    const d = arcRadius * Math.tan(theta / 2)
    const control = fixedAttach.translate(new Vector(d, 0).rotate(fixedAttachAngle))
    const normalAttachAngle = control.vectorFrom(normalCentre).angle()
    const normalAttach = normalCentre.translate(new Vector(normalRadius, 0).rotate(normalAttachAngle))

    const path = new SeekAndDestroy(fixedAttach, fixedAttachAngle, normalAttach, normaliseAngle(normalAttachAngle + Math.PI))
    path.forwardToWaypoint(d + fixedDivergeRadius - fixedRadius, Math.sign(path.endDirectionRelative) * theta, arcRadius)

    const longestSegment = path.segment(1)
    this.midShaft = longestSegment.from.translate(longestSegment.to.vectorFrom(longestSegment.from).scale(0.5))
    this.midShaftAngle = longestSegment.from.vectorFrom(longestSegment.to).angle()
    if (fixedEnd === 'start') {
      this.midShaftAngle = normaliseAngle(this.midShaftAngle + Math.PI)
    }

    this.path = fixedEnd === 'start' ? path : path.inverse()
  }

  distanceFrom(point:Point) {
    return this.path.distanceFrom(point)
  }

  draw(ctx:DrawingContext) {
    ctx.save()
    ctx.beginPath()
    this.path.draw(ctx)
    ctx.lineWidth = this.dimensions.arrowWidth
    ctx.strokeStyle = this.dimensions.arrowColor
    ctx.stroke()
    if (this.dimensions.hasArrowHead) {
      ctx.translate(...this.path.end.xy)
      ctx.rotate(this.path.endDirection)
      ctx.translate(this.dimensions.headHeight - this.dimensions.chinHeight, 0)
      ctx.fillStyle = this.dimensions.arrowColor
      arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, true, false)
      ctx.fill()
    }
    ctx.restore()
  }

  drawSelectionIndicator(ctx:DrawingContext) {
    const indicatorWidth = 10
    ctx.save()
    ctx.beginPath()
    this.path.draw(ctx)
    ctx.lineWidth = this.dimensions.arrowWidth + indicatorWidth
    ctx.lineCap = 'round'
    ctx.strokeStyle = this.dimensions.selectionColor
    ctx.stroke()
    if (this.dimensions.hasArrowHead) {
      ctx.translate(...this.path.end.xy)
      ctx.rotate(this.path.endDirection)
      ctx.translate(this.dimensions.headHeight - this.dimensions.chinHeight, 0)
      ctx.lineWidth = indicatorWidth
      ctx.lineJoin = 'round'
      arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, false, true)
      ctx.stroke()
    }
    ctx.restore()
  }

  midPoint() {
    return this.midShaft
  }

  shaftAngle() {
    return this.midShaftAngle
  }

  get arrowKind() {
    return 'straight'
  }
}
