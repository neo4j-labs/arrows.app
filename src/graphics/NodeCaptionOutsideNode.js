import {drawTextLine} from "./canvasRenderer";
import {fitTextToRectangle} from "./utils/rectangleWordWrap";
import { Vector } from "../model/Vector";

export class NodeCaptionOutsideNode {
  constructor(caption, nodePosition, radius, style, textMeasurement) {
    this.caption = caption
    this.nodePosition = nodePosition
    this.font = {
      fontWeight: style('caption-font-weight'),
      fontSize: style('caption-font-size'),
      fontFace: 'sans-serif'
    }
    textMeasurement.font = this.font
    this.fontColor = style('caption-color')
    this.angle = 0
    const measureWidth = (string) => textMeasurement.measureText(string).width;
    this.layout = fitTextToRectangle(caption, style('caption-max-width'), measureWidth)
    this.attachedAt = this.nodePosition.translate(
      new Vector(1, 0).rotate(this.angle).scale(radius + this.layout.margin))
  }

  draw(ctx) {
    ctx.save()

    ctx.fillStyle = this.fontColor
    ctx.font = this.font
    ctx.textBaseline = 'middle'

    const lineHeight = this.font.fontSize * 1.2
    const lines = this.layout.lines

    for (let i = 0; i< lines.length; i++) {
      const yPos = (i + 0.5 - lines.length / 2) * lineHeight
      drawTextLine(ctx, lines[i], this.attachedAt.translate(new Vector(0, yPos)), 'start')
    }

    ctx.restore()
  }
}