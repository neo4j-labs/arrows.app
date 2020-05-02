import {Point} from "../model/Point";
import {Vector} from "../model/Vector";
import {getDistanceToLine} from "./utils/geometryUtils";
import {green} from "../model/colors";
import arrowHead from "./arrowHead";

export class BalloonArrow {
  constructor(nodeCentre, nodeRadius, separation, length, arcRadius, arrowWidth, headWidth, headHeight, chinHeight, arrowColor) {
    this.nodeCentre = nodeCentre
    this.nodeRadius = nodeRadius
    this.length = length
    this.angle = 0
    this.arcRadius = arcRadius
    this.arrowWidth = arrowWidth
    this.headWidth = headWidth
    this.headHeight = headHeight
    this.chinHeight = chinHeight
    this.arrowColor = arrowColor

    this.displacement = separation / 2
    this.deflection = (this.displacement * 0.6) / nodeRadius

    this.startAttach = new Point(nodeRadius, 0).rotate(-this.deflection)
    this.endShaft = new Point(nodeRadius + headHeight - chinHeight, 0).rotate(this.deflection)

    this.control = this.startAttach.x * this.displacement / -this.startAttach.y
  }

  distanceFrom(point) {
    return Infinity
  }

  draw(ctx) {
    ctx.save()
    ctx.translate(...this.nodeCentre.xy)
    ctx.rotate(this.angle)
    ctx.beginPath()
    ctx.moveTo(this.startAttach.x, this.startAttach.y)
    ctx.arcTo(this.control, -this.displacement, this.length / 2, -this.displacement, this.arcRadius)
    ctx.arcTo(this.length, -this.displacement, this.length, 0, this.displacement)
    ctx.arcTo(this.length, this.displacement, this.length / 2, this.displacement, this.displacement)
    // ctx.lineTo(this.length, -this.displacement)
    ctx.arcTo(this.control, this.displacement, this.endShaft.x, this.endShaft.y, this.arcRadius)
    ctx.lineTo(this.endShaft.x, this.endShaft.y)
    ctx.lineWidth = this.arrowWidth
    ctx.strokeStyle = this.arrowColor
    ctx.stroke()
    ctx.rotate(Math.PI + this.deflection)
    ctx.translate(-this.nodeRadius, 0)
    ctx.fillStyle = this.arrowColor
    arrowHead(ctx, this.headHeight, this.chinHeight, this.headWidth, true, false)
    ctx.fill()
    ctx.restore()
  }

  drawSelectionIndicator(ctx) {
    ctx.fillStyle = 'red'
    ctx.circle(...this.midPoint().xy, 10, true, false)
  }

  midPoint() {
    return new Point(this.length + this.displacement * 2, 0).rotate(this.angle).translate(this.nodeCentre.vectorFromOrigin())
  }

  shaftAngle() {
    return this.angle
  }
}