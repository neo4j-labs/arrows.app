import {green} from "../model/colors";
import arrowHead from "./arrowHead";
import {Vector} from "../model/Vector";
import {SeekAndDestroy} from "./SeekAndDestroy";
import {normaliseAngle} from "./utils/angles";

export class RectilinearArrow {
  constructor(startCentre, endCentre, startRadius, endRadius, startAttachment, endAttachment, dimensions) {
    this.dimensions = dimensions
    this.arcRadius = 40 + Math.min(startAttachment.ordinal, startAttachment.total - startAttachment.ordinal - 1) * 10
    const startAttachAngle = startAttachment.attachment.angle
    const endAttachAngle = endAttachment.attachment.angle
    this.startAttach = startCentre.translate(new Vector(startRadius, (startAttachment.ordinal - (startAttachment.total - 1) / 2) * 10).rotate(startAttachAngle))
    this.endShaft = endCentre.translate(new Vector(endRadius + this.dimensions.headHeight - this.dimensions.chinHeight, (endAttachment.ordinal - (endAttachment.total - 1) / 2) * 10).rotate(endAttachAngle))
    // const endAttachRelative = this.endShaft.translate(this.startAttach.vectorFromOrigin().invert()).rotate(-startAttachAngle)

    const fanOut = startAttachment.total > endAttachment.total

    this.path = new SeekAndDestroy(this.startAttach, startAttachAngle, this.endShaft, normaliseAngle(endAttachAngle + Math.PI))
    this.path.forwardToWaypoint(fanOut ? this.arcRadius : this.path.endRelative.x - this.arcRadius, this.path.endRelative.y < 0 ? -Math.PI / 2 : Math.PI / 2, this.arcRadius)
    this.path.forwardToWaypoint(this.path.endRelative.x, this.path.endRelative.y < 0 ? -Math.PI / 2 : Math.PI / 2, this.arcRadius)

    // if (Math.abs(endAttachRelative.y) < this.arcRadius * 2) {
    //   this.startArcCentre = new Point(0, endAttachRelative.y < 0 ? -this.arcRadius : this.arcRadius)
    //   const endArcCentreY = endAttachRelative.y + (endAttachRelative.y < 0 ? this.arcRadius : -this.arcRadius)
    //   const endArcCentreX =
    //     Math.sqrt(Math.pow(2 * this.arcRadius, 2) - Math.pow(this.startArcCentre.y - endArcCentreY, 2))
    //   this.endArcCentre = new Point(endArcCentreX, endArcCentreY)
    //   const interCentreVector = this.endArcCentre.vectorFrom(this.startArcCentre)
    //   const theta = (Math.PI / 2) - Math.abs(interCentreVector.angle())
    //   const d = this.arcRadius * Math.tan(theta / 2)
    //   this.startControl = this.startAttach.translate(new Vector(fanOut ? d : endAttachRelative.x - endArcCentreX + d, 0).rotate(startAttachAngle))
    //   this.endControl = this.endShaft.translate(new Vector(fanOut ? endAttachRelative.x - endArcCentreX + d : d, 0).rotate(endAttachAngle))
    // } else {
    //   this.startControl = this.startAttach.translate(new Vector(fanOut ? this.arcRadius : endAttachRelative.x - this.arcRadius, 0).rotate(startAttachAngle))
    //   this.endControl = this.endShaft.translate(new Vector(fanOut ? endAttachRelative.x - this.arcRadius : this.arcRadius, 0).rotate(endAttachAngle))
    // }

    // this.shaftVector = this.endShaft.vectorFrom(this.endControl)

    const longestSegment = this.path.segment(fanOut ? 2 : 0)
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
