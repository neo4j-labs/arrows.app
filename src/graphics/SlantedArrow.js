import {getDistanceToLine} from "./utils/geometryUtils";
import {green} from "../model/colors";
import arrowHead from "./arrowHead";

export class SlantedArrow {
  constructor(startCentre, endCentre, startAttach, endAttach, arrowWidth, headWidth, headHeight, chinHeight, arrowColor) {
    const interNodeVector = endCentre.vectorFrom(startCentre)
    const arrowVector = endAttach.vectorFrom(startAttach);
    const factor = (arrowVector.distance() - headHeight + chinHeight) / arrowVector.distance();

    this.startCentre = startCentre
    this.angle = interNodeVector.angle()
    this.arrowWidth = arrowWidth
    this.headWidth = headWidth
    this.headHeight = headHeight
    this.chinHeight = chinHeight
    this.arrowColor = arrowColor
    this.startAttach = startAttach
    this.endAttach = endAttach
    this.endShaft = startAttach.translate(arrowVector.scale(factor))
  }

  distanceFrom(point) {
    const [startPoint, endPoint] = [this.startAttach, this.endAttach]
      .map(point => point.rotate(this.angle).translate(this.startCentre.vectorFromOrigin()))
    return getDistanceToLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, point.x, point.y)
  }

  draw(ctx) {
    ctx.save()
    ctx.translate(this.startCentre.x, this.startCentre.y)
    ctx.rotate(this.angle)
    ctx.beginPath()
    ctx.moveTo(this.startAttach.x, this.startAttach.y)
    ctx.lineTo(this.endShaft.x, this.endShaft.y)
    ctx.lineWidth = this.arrowWidth
    ctx.strokeStyle = this.arrowColor
    ctx.stroke()
    ctx.translate(this.endAttach.x, this.endAttach.y)
    ctx.rotate(this.endAttach.vectorFrom(this.startAttach).angle())
    arrowHead(ctx, this.headHeight, this.chinHeight, this.headWidth)
    ctx.fillStyle = this.arrowColor
    ctx.fill()
    ctx.restore()
  }

  drawSelectionIndicator(ctx) {
    const indicatorWidth = 10
    ctx.save()
    ctx.translate(this.startCentre.x, this.startCentre.y)
    ctx.rotate(this.angle)
    ctx.beginPath()
    ctx.moveTo(this.startAttach.x, this.startAttach.y)
    ctx.lineTo(this.endShaft.x, this.endShaft.y)
    ctx.lineWidth = this.arrowWidth + indicatorWidth
    ctx.strokeStyle = green
    ctx.stroke()
    ctx.translate(this.endAttach.x, this.endAttach.y)
    ctx.rotate(this.endAttach.vectorFrom(this.startAttach).angle())
    arrowHead(ctx, this.headHeight, this.chinHeight, this.headWidth)
    ctx.lineWidth = indicatorWidth
    ctx.lineJoin = 'round'
    ctx.stroke()
    ctx.restore()
  }

  midPoint() {
    return this.startAttach.translate(this.endAttach.vectorFrom(this.startAttach).scale(0.5))
      .rotate(this.angle)
      .translate(this.startCentre.vectorFromOrigin())
  }

  shaftAngle() {
    return this.angle + this.endAttach.vectorFrom(this.startAttach).angle()
  }
}