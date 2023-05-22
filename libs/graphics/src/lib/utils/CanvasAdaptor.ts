import {Coordinate, Point} from "@neo4j-arrows/model"
import {ImageInfo} from "./ImageCache"
import { FontStyle } from "../FontStyle"
import { DrawingContext } from "./DrawingContext"

export class CanvasAdaptor implements DrawingContext {
  constructor(readonly ctx:CanvasRenderingContext2D) {}

  save() {
    this.ctx.save()
  }

  restore() {
    this.ctx.restore()
  }

  translate(dx:number, dy:number) {
    this.ctx.translate(dx, dy)
  }

  scale(x:number) {
    this.ctx.scale(x, x)
  }

  rotate(angle:number) {
    this.ctx.rotate(angle)
  }

  beginPath() {
    this.ctx.beginPath()
  }

  closePath() {
    this.ctx.closePath()
  }

  moveTo(x:number, y:number) {
    this.ctx.moveTo(x, y)
  }


  lineTo(x:number, y:number) {
    this.ctx.lineTo(x, y)
  }

  arcTo(x1:number, y1:number, x2:number, y2:number, radius:number) {
    this.ctx.arcTo(x1, y1, x2, y2, radius)
  }

  arc(x:number, y:number, radius:number, startAngle:number, endAngle:number, anticlockwise:boolean) {
    this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise)
  }

  circle(x:number, y:number, radius:number, fill:boolean, stroke:boolean) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2, false)
    this.ctx.closePath()
    if (fill) this.ctx.fill()
    if (stroke) this.ctx.stroke()
  }

  rect(x:number, y:number, width:number, height:number, r:number, fill:boolean, stroke:boolean) {
    this.ctx.beginPath()
    this.ctx.moveTo(x, y + r)
    this.ctx.arc(x + r, y + r, r, -Math.PI, -Math.PI / 2)
    this.ctx.lineTo(x + width - r, y)
    this.ctx.arc(x + width - r, y + r, r, -Math.PI / 2, 0)
    this.ctx.lineTo(x + width, y + height - r)
    this.ctx.arc(x + width - r, y + height - r, r, 0, Math.PI / 2)
    this.ctx.lineTo(x + r, y + height)
    this.ctx.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI)
    this.ctx.closePath()
    if (fill) this.ctx.fill()
    if (stroke) this.ctx.stroke()
  }

  image(imageInfo:ImageInfo, x:number, y:number, width:number, height:number) {
    try {
      this.ctx.drawImage(imageInfo.image, x, y, width, height)
    } catch (e) {
      console.error(e)
    }
  }

  imageInCircle(imageInfo:ImageInfo, cx:number, cy:number, radius:number) {
    const ratio = imageInfo.width / imageInfo.height
    const {width, height} =
      (imageInfo.width > imageInfo.height) ? {
        width: 2 * radius * ratio,
        height: 2 * radius
      } : {
        width: 2 * radius,
        height: 2 * radius / ratio
      }
    this.ctx.save()
    try {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      this.ctx.clip()
      this.ctx.drawImage(imageInfo.image, cx - width / 2, cy - height / 2, width, height)
    } catch (e) {
      console.error(e)
    } finally {
      this.ctx.restore()
    }
  }

  polyLine(points:Coordinate[]) {
    this.ctx.beginPath()
    if (points.length > 0) {
      const startPoint = points[0]
      this.ctx.moveTo(startPoint.x, startPoint.y)
    }
    for (let i = 1; i < points.length; i++) {
      const point = points[i]
      this.ctx.lineTo(point.x, point.y)
    }
    this.ctx.stroke()
  }

  polygon(points:Coordinate[], fill:boolean, stroke:boolean) {
    this.ctx.beginPath()
    if (points.length > 0) {
      const startPoint = points[0]
      this.ctx.moveTo(startPoint.x, startPoint.y)
    }
    for (let i = 1; i < points.length; i++) {
      const point = points[i]
      this.ctx.lineTo(point.x, point.y)
    }
    this.ctx.closePath()
    if (fill) this.ctx.fill()
    if (stroke) this.ctx.stroke()
  }

  stroke() {
    this.ctx.stroke()
  }

  fill() {
    this.ctx.fill()
  }

  fillText(text:string, x:number, y:number) {
    this.ctx.fillText(text, x, y)
  }

  measureText(text:string) {
    return this.ctx.measureText(text)
  }

  setLineDash(dash:number[]) {
    this.ctx.setLineDash(dash)
  }

  set fillStyle(color:string | CanvasGradient | CanvasPattern) {
    this.ctx.fillStyle = color
  }

  set font(style:FontStyle) {
    this.ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`
  }

  set textBaseline(value:CanvasTextBaseline) {
    this.ctx.textBaseline = value
  }

  set textAlign(value:CanvasTextAlign) {
    this.ctx.textAlign = value
  }

  set lineWidth(value:number) {
    this.ctx.lineWidth = value
  }

  set lineJoin(value:CanvasLineJoin) {
    this.ctx.lineJoin = value
  }

  set lineCap(value:CanvasLineCap) {
    this.ctx.lineCap = value
  }

  set strokeStyle(value: string | CanvasGradient | CanvasPattern) {
    this.ctx.strokeStyle = value
  }
}