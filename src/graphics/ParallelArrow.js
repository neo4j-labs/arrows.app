import {Point} from "../model/Point";
import {Vector} from "../model/Vector";
import {getDistanceToLine} from "./utils/geometryUtils";
import {green} from "../model/colors";
import arrowHead from "./arrowHead";

export class ParallelArrow {
  constructor(startCentre, endCentre, startRadius, endRadius, startDeflection, endDeflection, displacement, arcRadius, dimensions) {
    const interNodeVector = endCentre.vectorFrom(startCentre);
    this.centreDistance = interNodeVector.distance()

    this.displacement = displacement
    this.startCentre = startCentre
    this.endCentre = endCentre
    this.startRadius = startRadius
    this.endRadius = endRadius
    this.angle = interNodeVector.angle()
    this.midShaft = this.centreDistance / 2
    this.arcRadius = arcRadius
    this.dimensions = dimensions

    this.startAttach = new Point(startRadius, 0).rotate(startDeflection)
    this.endDeflection = endDeflection
    this.endAttach = new Point(-endRadius, 0).rotate(-endDeflection)
      .translate(new Vector(this.centreDistance, 0))

    this.startControl = this.startAttach.x * displacement / this.startAttach.y
    this.endControl = this.centreDistance - (this.centreDistance - this.endAttach.x) * displacement / this.endAttach.y
    this.endShaft = new Point(-(endRadius + dimensions.headHeight - dimensions.chinHeight), 0).rotate(-endDeflection)
      .translate(new Vector(this.centreDistance, 0))

    const endArcHeight = arcRadius - arcRadius * Math.cos(Math.abs(endDeflection))
    this.drawArcs =
      this.midShaft - this.startControl > this.arcRadius * Math.tan(Math.abs(startDeflection) / 2) &&
      this.endControl - this.midShaft > this.arcRadius * Math.tan(Math.abs(endDeflection) / 2) &&
      (displacement < 0 ? this.endShaft.y - endArcHeight > displacement : this.endShaft.y + endArcHeight < displacement)
  }

  distanceFrom(point) {
    const [startPoint, endPoint] = (this.drawArcs ?
      [new Point(this.startControl, this.displacement), new Point(this.endControl, this.displacement)] :
      [this.startAttach, this.endAttach])
      .map(point => point.rotate(this.angle).translate(this.startCentre.vectorFromOrigin()))
    return getDistanceToLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, point.x, point.y)
  }

  draw(ctx) {
    ctx.save()
    ctx.translate(this.startCentre.x, this.startCentre.y)
    ctx.rotate(this.angle)
    ctx.beginPath()
    this.path(ctx)
    ctx.lineWidth = this.dimensions.arrowWidth
    ctx.strokeStyle = this.dimensions.arrowColor
    ctx.stroke()
    ctx.translate(this.centreDistance, 0)
    ctx.rotate(-this.endDeflection)
    ctx.translate(-this.endRadius, 0)
    ctx.fillStyle = this.dimensions.arrowColor
    arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, true, false)
    ctx.fill()
    ctx.restore()
  }

  drawSelectionIndicator(ctx) {
    const indicatorWidth = 10
    ctx.save()
    ctx.translate(this.startCentre.x, this.startCentre.y)
    ctx.rotate(this.angle)
    ctx.beginPath()
    this.path(ctx)
    ctx.lineWidth = this.dimensions.arrowWidth + indicatorWidth
    ctx.lineCap = 'round'
    ctx.strokeStyle = green
    ctx.stroke()
    ctx.translate(this.centreDistance, 0)
    ctx.rotate(-this.endDeflection)
    ctx.translate(-this.endRadius, 0)
    ctx.lineWidth = indicatorWidth
    ctx.lineJoin = 'round'
    arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, false, true)
    ctx.stroke()
    ctx.restore()
  }

  path(ctx) {
    ctx.moveTo(this.startAttach.x, this.startAttach.y)
    ctx.arcTo(this.startControl, this.displacement, this.midShaft, this.displacement, this.arcRadius)
    ctx.arcTo(this.endControl, this.displacement, this.endShaft.x, this.endShaft.y, this.arcRadius)
    ctx.lineTo(this.endShaft.x, this.endShaft.y)
  }

  midPoint() {
    return new Point((this.centreDistance + this.startRadius - this.endRadius) / 2, this.displacement).rotate(this.angle).translate(this.startCentre.vectorFromOrigin())
  }

  shaftAngle() {
    return this.angle
  }
}