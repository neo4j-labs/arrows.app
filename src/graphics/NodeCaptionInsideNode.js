import {drawTextLine} from "./canvasRenderer";
import {fitTextToCircle} from "./utils/circleWordWrap";
import { Vector } from "../model/Vector";
import BoundingBox from "./utils/BoundingBox";

export class NodeCaptionInsideNode {
  constructor(caption, nodePosition, radius, scaleFactor, style, textMeasurement) {
    this.caption = caption
    this.nodePosition = nodePosition
    this.radius = radius
    this.font = {
      fontWeight: style('caption-font-weight'),
      fontSize: style('caption-font-size') * scaleFactor,
      fontFace: 'sans-serif'
    }
    textMeasurement.font = this.font
    this.fontColor = style('caption-color')
    this.orientation = { horizontal: 'center', vertical: 'center' }
    this.lineHeight = this.font.fontSize * 1.2
    const measureWidth = (string) => textMeasurement.measureText(string).width
    const padding = style('node-padding')
    this.layout = fitTextToCircle(this.caption, this.radius - padding, measureWidth, this.lineHeight)
  }

  draw(ctx) {
    ctx.save()

    ctx.font = this.font
    ctx.fillStyle = this.fontColor
    ctx.textBaseline = 'middle'

    for (let i = 0; i< this.layout.lines.length; i++) {
      const yPos = this.layout.top + (i + 0.5) * this.lineHeight
      drawTextLine(ctx, this.layout.lines[i], this.nodePosition.translate(new Vector(0, yPos)), 'center')
    }

    ctx.restore()
  }

  drawSelectionIndicator() {
    // Nothing to do here; we're inside a node.
  }

  get contentsFit() {
    return this.layout.allTextFits
  }

  boundingBox() {
    const height = this.layout.lines.length * this.lineHeight
    return new BoundingBox(
      this.nodePosition.x - this.radius,
      this.nodePosition.x + this.radius,
      this.nodePosition.y + this.layout.top,
      this.nodePosition.y + this.layout.top + height
    )
  }

  distanceFrom(point) {
    return this.nodePosition.vectorFrom(point).distance()
  }
}