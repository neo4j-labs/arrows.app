import {drawTextLine} from "./canvasRenderer";
import {fitTextToCircle} from "./utils/circleWordWrap";
import {Point} from "../model/Point";
import BoundingBox from "./utils/BoundingBox";

export class NodeCaptionFillNode {
  constructor(caption, radius, editing, style, textMeasurement) {
    this.caption = caption
    this.radius = radius
    this.editing = editing
    this.font = {
      fontWeight: style('caption-font-weight'),
      fontSize: style('caption-font-size'),
      fontFace: 'Caveat'
    }
    textMeasurement.font = this.font
    this.fontColor = style('caption-color')
    this.orientation = { horizontal: 'center', vertical: 'center' }
    this.lineHeight = this.font.fontSize * 1.2
    const measureWidth = (string) => textMeasurement.measureText(string).width
    this.layout = fitTextToCircle(this.caption, Math.max(1, this.radius), measureWidth, this.lineHeight)
  }

  get type() {
    return 'CAPTION'
  }

  draw(ctx) {
    if (this.editing) return

    ctx.save()

    ctx.font = this.font
    ctx.fillStyle = this.fontColor
    ctx.textBaseline = 'middle'

    for (let i = 0; i< this.layout.lines.length; i++) {
      const yPos = this.layout.top + (i + 0.5) * this.lineHeight
      drawTextLine(ctx, this.layout.lines[i], new Point(0, yPos), 'center')
    }

    ctx.restore()
  }

  get contentsFit() {
    return this.layout.allTextFits
  }

  boundingBox() {
    const height = this.layout.lines.length * this.lineHeight
    return new BoundingBox(
      -this.radius,
      this.radius,
      this.layout.top,
      this.layout.top + height
    )
  }

  distanceFrom(point) {
    return point.vectorFromOrigin().distance()
  }
}