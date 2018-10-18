import {getDistanceToLine} from "./utils/geometryUtils";
import {Point} from "../model/Point";
import {green} from "../model/colors";
import arrowHead from "./arrowHead";

export class StraightArrow {
  constructor(startCentre, endCentre, startRadius, endRadius, arrowWidth, headWidth, headHeight, chinHeight, arrowColor) {
    const interNodeVector = endCentre.vectorFrom(startCentre);
    const centreDistance = interNodeVector.distance()
    this.startCentre = startCentre
    this.angle = interNodeVector.angle()
    this.foot = startRadius
    this.headHeight = headHeight
    this.chinHeight = chinHeight
    this.topOfHead = centreDistance - endRadius
    this.neck = this.topOfHead - headHeight + chinHeight
    this.arrowWidth = arrowWidth
    this.headWidth = headWidth
    this.arrowColor = arrowColor
  }

  distanceFrom(point) {
    const [startPoint, endPoint] = [new Point(this.foot, 0), new Point(this.topOfHead, 0)]
      .map(point => point.rotate(this.angle).translate(this.startCentre.vectorFromOrigin()))
    return getDistanceToLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, point.x, point.y)
  }

  draw(ctx) {
    ctx.save()
    ctx.translate(this.startCentre.x, this.startCentre.y)
    ctx.rotate(this.angle)
    ctx.beginPath()
    ctx.moveTo(this.foot, 0)
    ctx.lineTo(this.neck, 0)
    ctx.lineWidth = this.arrowWidth
    ctx.strokeStyle = this.arrowColor
    ctx.stroke()
    ctx.translate(this.topOfHead, 0)
    arrowHead(ctx, this.headHeight, this.chinHeight, this.headWidth)
    ctx.fillStyle = this.arrowColor
    ctx.fill()
    ctx.restore()
  }

  drawSelectionIndicator(ctx) {
    const indicatorWidth = 10
    ctx.save()
    ctx.strokeStyle = green
    ctx.translate(this.startCentre.x, this.startCentre.y)
    ctx.rotate(this.angle)
    ctx.beginPath()
    ctx.moveTo(this.foot, 0)
    ctx.lineTo(this.neck, 0)
    ctx.lineWidth = this.arrowWidth + indicatorWidth
    ctx.stroke()
    ctx.translate(this.topOfHead, 0)
    arrowHead(ctx, this.headHeight, this.chinHeight, this.headWidth)
    ctx.lineWidth = indicatorWidth
    ctx.lineJoin = 'round'
    ctx.stroke()
    ctx.restore()
  }

  midPoint() {
    return new Point((this.foot + this.topOfHead) / 2, 0).rotate(this.angle).translate(this.startCentre.vectorFromOrigin())
  }

  shaftAngle() {
    return this.angle
  }
}