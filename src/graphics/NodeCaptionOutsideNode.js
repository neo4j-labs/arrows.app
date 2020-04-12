import {drawTextLine} from "./canvasRenderer";
import {fitTextToRectangle} from "./utils/rectangleWordWrap";
import { Vector } from "../model/Vector";
import {orientationFromName} from "./circumferentialTextAlignment";
import BoundingBox from "./utils/BoundingBox";

export class NodeCaptionOutsideNode {
  constructor(caption, nodePosition, radius, captionPosition, style, textMeasurement) {
    this.caption = caption
    this.nodePosition = nodePosition
    this.font = {
      fontWeight: style('caption-font-weight'),
      fontSize: style('caption-font-size'),
      fontFace: 'sans-serif'
    }
    textMeasurement.font = this.font
    this.fontColor = style('caption-color')
    this.orientation = orientationFromName(captionPosition)
    const measureWidth = (string) => textMeasurement.measureText(string).width;
    this.layout = fitTextToRectangle(caption, style('caption-max-width'), measureWidth)
    this.attachedAt = this.nodePosition.translate(
      new Vector(1, 0).rotate(this.orientation.angle).scale(radius + this.layout.margin))
    this.lineHeight = this.font.fontSize * 1.2
  }

  draw(ctx) {
    ctx.save()

    ctx.fillStyle = this.fontColor
    ctx.font = this.font
    ctx.textBaseline = 'middle'

    const lines = this.layout.lines

    const verticalLineNumberOffset = (() => {
      switch (this.orientation.vertical) {
        case 'top':
          return -lines.length
        case 'center':
          return -lines.length / 2
        case 'bottom':
          return 0
      }
    })()
    for (let i = 0; i< lines.length; i++) {
      const yPos = (i + 0.5 + verticalLineNumberOffset) * this.lineHeight
      const position = this.attachedAt.translate(new Vector(0, yPos))
      drawTextLine(ctx, lines[i], position, this.orientation.horizontal)
    }

    ctx.restore()
  }

  captionFits() {
    return true
  }

  boundingBox() {
    const width = this.layout.actualWidth
    const height = this.layout.lines.length * this.lineHeight

    const left = (() => {
      switch (this.orientation.horizontal) {
        case 'end':
          return -width
        case 'center':
          return -width / 2
        case 'start':
          return 0
      }
    })() + this.attachedAt.x
    const top = (() => {
      switch (this.orientation.vertical) {
        case 'top':
          return -height
        case 'center':
          return -height / 2
        case 'bottom':
          return 0
      }
    })() + this.attachedAt.y

    return new BoundingBox(left, left + width, top, top + height)
  }
}