import {Point} from "@neo4j-arrows/model";
import { ArrowDimensions } from "./arrowDimensions";
import arrowHead from "./arrowHead";
import {BoundingBox} from "./utils/BoundingBox";
import {perpendicular} from "./utils/angles";
import { CanvasAdaptor } from "./utils/CanvasAdaptor";
import { DrawingContext } from "./utils/DrawingContext";

export class BalloonArrow {
  nodeCentre: Point;
  nodeRadius: number;
  angle: number;
  length: number;
  arcRadius: number;
  dimensions: ArrowDimensions;
  displacement: number;
  deflection: number;
  startAttach: Point;
  endShaft: Point;
  control: number;

  constructor(nodeCentre:Point, nodeRadius:number, angle:number, separation:number, length:number, arcRadius:number, dimensions:ArrowDimensions) {
    this.nodeCentre = nodeCentre
    this.nodeRadius = nodeRadius
    this.angle = angle
    this.length = length
    this.arcRadius = arcRadius
    this.dimensions = dimensions

    this.displacement = separation / 2
    this.deflection = (this.displacement * 0.6) / nodeRadius

    this.startAttach = new Point(nodeRadius, 0).rotate(-this.deflection)
    this.endShaft = new Point(nodeRadius + dimensions.headHeight - dimensions.chinHeight, 0).rotate(this.deflection)

    this.control = this.startAttach.x * this.displacement / -this.startAttach.y
  }

  distanceFrom(point:Point) {
    const localPoint = point.translate(this.nodeCentre.vectorFromOrigin().invert()).rotate(-this.angle)
    const rectangle = new BoundingBox(this.nodeRadius, this.length - this.displacement,
      -(this.displacement + this.dimensions.arrowWidth / 2), this.displacement + this.dimensions.arrowWidth / 2)
    const turnCentre = new Point(this.length - this.displacement, 0)
    return rectangle.contains(localPoint) || turnCentre.vectorFrom(localPoint).distance() < this.displacement + this.dimensions.arrowWidth / 2 ? 0 : Infinity
  }

  draw(ctx:DrawingContext) {
    ctx.save()
    ctx.translate(...this.nodeCentre.xy)
    ctx.rotate(this.angle)
    ctx.beginPath()
    this.path(ctx)
    ctx.lineWidth = this.dimensions.arrowWidth
    ctx.strokeStyle = this.dimensions.arrowColor
    ctx.stroke()
    if (this.dimensions.hasArrowHead) {
      ctx.rotate(Math.PI + this.deflection)
      ctx.translate(-this.nodeRadius, 0)
      ctx.fillStyle = this.dimensions.arrowColor
      arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, true, false)
      ctx.fill()
    }
    ctx.restore()
  }

  drawSelectionIndicator(ctx:DrawingContext) {
    const indicatorWidth = 10
    ctx.save()
    ctx.translate(...this.nodeCentre.xy)
    ctx.rotate(this.angle)
    ctx.beginPath()
    this.path(ctx)
    ctx.lineWidth = this.dimensions.arrowWidth + indicatorWidth
    ctx.lineCap = 'round'
    ctx.strokeStyle = this.dimensions.selectionColor
    ctx.stroke()
    if (this.dimensions.hasArrowHead) {
      ctx.rotate(Math.PI + this.deflection)
      ctx.translate(-this.nodeRadius, 0)
      ctx.lineWidth = indicatorWidth
      ctx.lineJoin = 'round'
      arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, false, true)
      ctx.stroke()
    }
    ctx.restore()
  }

  path(ctx:DrawingContext) {
    ctx.moveTo(this.startAttach.x, this.startAttach.y)
    ctx.arcTo(this.control, -this.displacement, this.length / 2, -this.displacement, this.arcRadius)
    ctx.arcTo(this.length, -this.displacement, this.length, 0, this.displacement)
    ctx.arcTo(this.length, this.displacement, this.length / 2, this.displacement, this.displacement)
    ctx.arcTo(this.control, this.displacement, this.endShaft.x, this.endShaft.y, this.arcRadius)
    ctx.lineTo(this.endShaft.x, this.endShaft.y)
  }

  midPoint() {
    return new Point(this.length - this.displacement, 0).rotate(this.angle).translate(this.nodeCentre.vectorFromOrigin())
  }

  shaftAngle() {
    return perpendicular(this.angle)
  }

  get arrowKind() {
    return 'loopy'
  }
}