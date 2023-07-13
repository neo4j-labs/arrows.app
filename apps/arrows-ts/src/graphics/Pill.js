import BoundingBox from "./utils/BoundingBox";
import {selectionBorder, selectionHandle} from "../model-old/colors";
import {Point} from "../model-old/Point";
import {adaptForBackground} from "./backgroundColorAdaption";

export default class Pill {
  constructor(text, editing, style, textMeasurement) {
    this.text = text

    this.backgroundColor = style('label-background-color')
    this.strokeColor = style('label-border-color')
    this.fontColor = style('label-color')
    this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style)
    this.borderWidth = style('label-border-width')
    this.display = style('label-display')

    const padding = style('label-padding')

    this.font = {
      fontWeight: 'normal',
      fontSize: style('label-font-size'),
      fontFamily: style('font-family')
    }
    textMeasurement.font = this.font
    this.textWidth = textMeasurement.measureText(text).width

    this.height = this.font.fontSize + padding * 2 + this.borderWidth
    this.radius = this.display === 'pill' ? this.height / 2 : 0
    this.width = this.textWidth + this.radius * 2

    this.editing = editing
  }

  draw(ctx) {
    ctx.save()
    ctx.fillStyle = this.backgroundColor
    ctx.strokeStyle = this.strokeColor
    ctx.lineWidth = this.borderWidth
    if (this.display === 'pill') {
      ctx.rect(0, 0, this.width, this.height, this.radius, true, this.borderWidth > 0)
    }

    if (!this.editing) {
      ctx.font = this.font
      ctx.textBaseline = 'middle'
      ctx.fillStyle = this.fontColor
      ctx.fillText(this.text, this.radius, this.height / 2)
    }
    ctx.restore()
  }

  drawSelectionIndicator(ctx) {
    const indicatorWidth = 10
    ctx.save()
    ctx.strokeStyle = this.selectionColor
    ctx.lineWidth = indicatorWidth
    ctx.lineJoin = 'round'
    ctx.rect(
      -this.borderWidth / 2, -this.borderWidth / 2,
      this.width + this.borderWidth, this.height + this.borderWidth,
      this.radius + this.borderWidth / 2, false, true
    )
    ctx.restore()
  }

  contains(localPoint) {
    const rectangle = new BoundingBox(this.radius, this.width, 0, this.height)
    const leftCenter = new Point(this.radius, this.radius)
    const rightCenter = new Point(this.radius + this.width, this.radius)
    return rectangle.contains(localPoint) ||
      leftCenter.vectorFrom(localPoint).distance() < this.radius ||
      rightCenter.vectorFrom(localPoint).distance() < this.radius
  }

  boundingBox() {
    return new BoundingBox(
      -this.borderWidth / 2,
      this.width + this.borderWidth / 2,
      -this.borderWidth / 2,
      this.height + this.borderWidth / 2
    )
  }
}