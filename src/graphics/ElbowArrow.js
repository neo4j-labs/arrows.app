import {getDistanceToLine} from "./utils/geometryUtils";
import {green} from "../model/colors";
import arrowHead from "./arrowHead";
import {Point} from "../model/Point";
import {Vector} from "../model/Vector";

export class ElbowArrow {
  constructor(startCentre, endCentre, startRadius, endRadius, startAttachment, endAttachment, dimensions) {
    this.dimensions = dimensions
    this.arcRadius = 40
    const startAttachAngle = startAttachment.attachment.angle
    this.startAttach = startCentre.translate(new Vector(startRadius, (startAttachment.ordinal - (startAttachment.total - 1) / 2) * 10).rotate(startAttachAngle))
    const endCentreRelative = endCentre.translate(this.startAttach.vectorFromOrigin().invert()).rotate(-startAttachAngle)
    const startArcCentre = new Point(0, endCentreRelative.y < 0 ? -this.arcRadius : this.arcRadius)
    const arcCentreVector = endCentreRelative.vectorFrom(startArcCentre)
    const gamma = Math.asin(this.arcRadius / arcCentreVector.distance())
    const theta = gamma + Math.abs(arcCentreVector.angle())
    const d = this.arcRadius * Math.tan(theta / 2)
    this.startControl = this.startAttach.translate(new Vector(d, 0).rotate(startAttachAngle))
    this.shaftVector = endCentre.vectorFrom(this.startControl)
    const factor = (this.shaftVector.distance() - endRadius - dimensions.headHeight + dimensions.chinHeight) / this.shaftVector.distance()
    this.endShaft = this.startControl.translate(this.shaftVector.scale(factor))
    this.midShaft = this.startControl.translate(this.shaftVector.scale(factor / 2))
  }

  distanceFrom(point) {
    return getDistanceToLine(...this.startControl.xy, ...this.endShaft.xy, ...point.xy)
  }

  draw(ctx) {
    ctx.save()
    ctx.beginPath()
    this.path(ctx)
    ctx.lineWidth = this.dimensions.arrowWidth
    ctx.strokeStyle = this.dimensions.arrowColor
    ctx.stroke()
    ctx.translate(...this.endShaft.xy)
    ctx.rotate(this.shaftVector.angle())
    ctx.translate(this.dimensions.headHeight - this.dimensions.chinHeight, 0)
    arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, true, false)
    ctx.fillStyle = this.dimensions.arrowColor
    ctx.fill()
    ctx.restore()
  }

  drawSelectionIndicator(ctx) {
    const indicatorWidth = 10
    ctx.save()
    ctx.beginPath()
    this.path(ctx)
    ctx.lineWidth = this.dimensions.arrowWidth + indicatorWidth
    ctx.lineCap = 'round'
    ctx.strokeStyle = green
    ctx.stroke()
    ctx.translate(...this.endShaft.xy)
    ctx.rotate(this.shaftVector.angle())
    ctx.translate(this.dimensions.headHeight - this.dimensions.chinHeight, 0)
    ctx.lineWidth = indicatorWidth
    ctx.lineJoin = 'round'
    arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, false, true)
    ctx.stroke()
    ctx.restore()
  }

  path(ctx) {
    ctx.moveTo(...this.startAttach.xy)
    ctx.arcTo(...this.startControl.xy, ...this.endShaft.xy, this.arcRadius)
    ctx.lineTo(...this.endShaft.xy)
  }

  midPoint() {
    return this.midShaft
  }

  shaftAngle() {
    return this.shaftVector.angle()
  }

  get arrowKind() {
    return 'straight'
  }
}
