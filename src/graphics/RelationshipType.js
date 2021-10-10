import {selectionBorder} from "../model/colors";
import {Point} from "../model/Point";
import BoundingBox from "./utils/BoundingBox";

export class RelationshipType {
  constructor(text, orientation, editing, style, textMeasurement) {
    this.text = text
    this.editing = editing
    this.padding = style('type-padding')
    this.borderWidth = style('type-border-width')
    this.fontColor = style('type-color')
    this.borderColor = style('type-border-color')
    this.backgroundColor = style('type-background-color')
    this.font = {
      fontWeight: 'normal',
      fontSize: style('type-font-size'),
      fontFamily: 'Caveat'
    }
    textMeasurement.font = this.font
    const textWidth = textMeasurement.measureText(text).width
    this.width = textWidth + (this.padding + this.borderWidth) * 2
    this.height = this.font.fontSize + (this.padding + this.borderWidth) * 2
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
    this.boxPosition = new Point(
      horizontalPosition,
      0
    )
  }

  get type() {
    return 'TYPE'
  }

  draw(ctx) {
    if (this.text) {
      ctx.save()
      ctx.translate(...this.boxPosition.xy)
      ctx.fillStyle = this.backgroundColor
      ctx.strokeStyle = this.borderColor
      ctx.lineWidth = this.borderWidth
      ctx.rect(
        this.borderWidth / 2,
        this.borderWidth / 2,
        this.width - this.borderWidth,
        this.height - this.borderWidth,
        this.padding,
        true,
        this.borderWidth > 0
      )
      if (!this.editing) {
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'left'
        ctx.font = this.font
        ctx.fillStyle = this.fontColor
        ctx.fillText(this.text, this.borderWidth + this.padding, this.height / 2)
      }
      ctx.restore()
    }
  }

  drawSelectionIndicator(ctx) {
    if (this.text) {
      const indicatorWidth = 10
      ctx.save()
      ctx.translate(...this.boxPosition.xy)
      ctx.strokeStyle = selectionBorder
      ctx.lineWidth = indicatorWidth
      ctx.rect(
        this.borderWidth / 2,
        this.borderWidth / 2,
        this.width - this.borderWidth,
        this.height - this.borderWidth,
        this.padding,
        false,
        true
      )
      ctx.restore()
    }
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
