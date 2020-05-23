import {green} from "../model/colors";
import arrowHead from "./arrowHead";
import {Point} from "../model/Point";
import {Vector} from "../model/Vector";
import {SeekAndDestroy} from "./SeekAndDestroy";
import {normaliseAngle} from "./utils/angles";

export class ElbowArrow {
  constructor(startCentre, endCentre, startRadius, endRadius, startAttachment, endAttachment, dimensions) {
    this.dimensions = dimensions
    const arcRadius = 40
    const startAttachAngle = startAttachment.attachment.angle
    this.startAttach = startCentre.translate(new Vector(startRadius, (startAttachment.ordinal - (startAttachment.total - 1) / 2) * 10).rotate(startAttachAngle))
    const endCentreRelative = endCentre.translate(this.startAttach.vectorFromOrigin().invert()).rotate(-startAttachAngle)
    const startArcCentre = new Point(0, endCentreRelative.y < 0 ? -arcRadius : arcRadius)
    const arcCentreVector = endCentreRelative.vectorFrom(startArcCentre)
    const gamma = Math.asin(arcRadius / arcCentreVector.distance())
    const theta = gamma + Math.abs(arcCentreVector.angle())
    const d = arcRadius * Math.tan(theta / 2)
    const startControl = this.startAttach.translate(new Vector(d, 0).rotate(startAttachAngle))
    const endAttachAngle = startControl.vectorFrom(endCentre).angle()
    this.endShaft = endCentre.translate(new Vector(endRadius + this.dimensions.headHeight - this.dimensions.chinHeight, 0).rotate(endAttachAngle))

    this.path = new SeekAndDestroy(this.startAttach, startAttachAngle, this.endShaft, normaliseAngle(endAttachAngle + Math.PI))
    this.path.forwardToWaypoint(d, Math.sign(this.path.endDirectionRelative) * theta, arcRadius)
    
    const longestSegment = this.path.segment(1)
    this.midShaft = longestSegment.from.translate(longestSegment.to.vectorFrom(longestSegment.from).scale(0.5))
    this.midShaftAngle = longestSegment.from.vectorFrom(longestSegment.to).angle()
  }

  distanceFrom(point) {
    return this.path.distanceFrom(point)
  }

  draw(ctx) {
    ctx.save()
    ctx.beginPath()
    this.path.draw(ctx)
    ctx.lineWidth = this.dimensions.arrowWidth
    ctx.strokeStyle = this.dimensions.arrowColor
    ctx.stroke()
    ctx.translate(...this.endShaft.xy)
    ctx.rotate(this.path.endDirection)
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
    this.path.draw(ctx)
    ctx.lineWidth = this.dimensions.arrowWidth + indicatorWidth
    ctx.lineCap = 'round'
    ctx.strokeStyle = green
    ctx.stroke()
    ctx.translate(...this.endShaft.xy)
    ctx.rotate(this.path.endDirection)
    ctx.translate(this.dimensions.headHeight - this.dimensions.chinHeight, 0)
    ctx.lineWidth = indicatorWidth
    ctx.lineJoin = 'round'
    arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, false, true)
    ctx.stroke()
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
