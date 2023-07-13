import {drawTextLine} from "./canvasRenderer";
import {fitTextToRectangle} from "./utils/rectangleWordWrap";
import {Point} from "../model-old/Point";
import BoundingBox from "./utils/BoundingBox";
import {selectionBorder, selectionHandle} from "../model-old/colors";
import {adaptForBackground} from "./backgroundColorAdaption";

export class NodeCaptionOutsideNode {
  constructor(caption, orientation, editing, style, textMeasurement) {
    this.caption = caption
    this.orientation = orientation
    this.editing = editing
    this.font = {
      fontWeight: style('caption-font-weight'),
      fontSize: style('caption-font-size'),
      fontFamily: style('font-family')
    }
    textMeasurement.font = this.font
    this.fontColor = style('caption-color')
    this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style)
    this.lineHeight = this.font.fontSize * 1.2
    const measureWidth = (string) => textMeasurement.measureText(string).width;
    this.layout = fitTextToRectangle(caption, style('caption-max-width'), measureWidth)
    this.width = this.layout.actualWidth
    this.height = this.layout.lines.length * this.lineHeight
    const horizontalPosition = (() => {
      switch (orientation.horizontal) {
        case 'start':
          return 0
        case 'center':
          return -this.width / 2
        case 'end':
          return -this.width
      }
    })()
    this.boxPosition = new Point(horizontalPosition, 0)
  }

  get type() {
    return 'CAPTION'
  }

  draw(ctx) {
    if (this.editing) return

    ctx.save()

    ctx.fillStyle = this.fontColor
    ctx.font = this.font
    ctx.textBaseline = 'middle'

    const lines = this.layout.lines

    for (let i = 0; i< lines.length; i++) {
      const yPos = (i + 0.5) * this.lineHeight
      const position = new Point(0, yPos)
      drawTextLine(ctx, lines[i], position, this.orientation.horizontal)
    }

    ctx.restore()
  }

  drawSelectionIndicator(ctx) {
    const indicatorWidth = 10
    const boundingBox = this.boundingBox()
    ctx.save()
    ctx.strokeStyle = this.selectionColor
    ctx.lineWidth = indicatorWidth
    ctx.lineJoin = 'round'
    ctx.rect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height, 0, false, true)
    ctx.restore()
  }

  get contentsFit() {
    return true
  }

  boundingBox() {
    const left = this.boxPosition.x
    const top = this.boxPosition.y

    return new BoundingBox(left, left + this.width, top, top + this.height)
  }

  distanceFrom(point) {
    return this.boundingBox().contains(point) ? 0 : Infinity
  }
}