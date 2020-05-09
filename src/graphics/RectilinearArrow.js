import {getDistanceToLine} from "./utils/geometryUtils";
import {green} from "../model/colors";
import arrowHead from "./arrowHead";
import {Point} from "../model/Point";
import {Vector} from "../model/Vector";

export class RectilinearArrow {
  constructor(startCentre, endCentre, startRadius, endRadius, startAttachment, endAttachment, dimensions) {
    this.dimensions = dimensions
    this.arcRadius = 40 + Math.min(startAttachment.ordinal, startAttachment.total - startAttachment.ordinal - 1) * 10
    const startAttachAngle = startAttachment.attachment.angle
    const endAttachAngle = endAttachment.attachment.angle
    this.startAttach = startCentre.translate(new Vector(startRadius, (startAttachment.ordinal - (startAttachment.total - 1) / 2) * 10).rotate(startAttachAngle))
    this.endAttach = endCentre.translate(new Vector(endRadius, (endAttachment.ordinal - (endAttachment.total - 1) / 2) * 10).rotate(endAttachAngle))
    const endAttachRelative = this.endAttach.translate(this.startAttach.vectorFromOrigin().invert()).rotate(-startAttachAngle)

    if (Math.abs(endAttachRelative.y) < this.arcRadius * 2) {
      this.startArcCentre = new Point(0, endAttachRelative.y < 0 ? -this.arcRadius : this.arcRadius)
      const endArcCentreY = endAttachRelative.y + (endAttachRelative.y < 0 ? this.arcRadius : -this.arcRadius)
      const endArcCentreX =
        Math.sqrt(Math.pow(2 * this.arcRadius, 2) - Math.pow(this.startArcCentre.y - endArcCentreY, 2))
      this.endArcCentre = new Point(endArcCentreX, endArcCentreY)
      const interCentreVector = this.endArcCentre.vectorFrom(this.startArcCentre)
      const theta = (Math.PI / 2) - Math.abs(interCentreVector.angle())
      const d = this.arcRadius * Math.tan(theta / 2)
      this.startControl = this.startAttach.translate(new Vector(d, 0).rotate(startAttachAngle))
      this.endControl = this.endAttach.translate(new Vector(endAttachRelative.x - endArcCentreX + d, 0).rotate(endAttachAngle))
    } else {
      this.startControl = this.startAttach.translate(new Vector(this.arcRadius, 0).rotate(startAttachAngle))
      this.endControl = this.endAttach.translate(new Vector(endAttachRelative.x - this.arcRadius, 0).rotate(endAttachAngle))
    }

    this.shaftVector = this.endAttach.vectorFrom(this.endControl)
    const factor = (this.shaftVector.distance() - dimensions.headHeight + dimensions.chinHeight) / this.shaftVector.distance()
    this.endShaft = this.endControl.translate(this.shaftVector.scale(factor))
    this.midShaft = this.endControl.translate(this.shaftVector.scale(factor / 2))
  }

  distanceFrom(point) {
    return getDistanceToLine(...this.endControl.xy, ...this.endAttach.xy, ...point.xy)
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
    ctx.arcTo(...this.startControl.xy, ...this.endControl.xy, this.arcRadius)
    ctx.arcTo(...this.endControl.xy, ...this.endShaft.xy, this.arcRadius)
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
