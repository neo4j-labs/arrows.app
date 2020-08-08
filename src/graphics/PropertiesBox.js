import {Point} from "../model/Point";
import BoundingBox from "./utils/BoundingBox";
import {drawTextLine} from "./canvasRenderer";
import {selectionBorder, selectionHandle} from "../model/colors";

export class PropertiesBox {
  constructor(properties, editing, style, textMeasurement) {
    this.editing = editing
    this.font = {
      fontWeight: style('property-font-weight'),
      fontSize: style('property-font-size'),
      fontFace: 'sans-serif'
    }
    textMeasurement.font = this.font
    this.fontColor = style('property-color')
    this.lineHeight = this.font.fontSize * 1.2
    this.properties = Object.keys(properties).map(key => ({
      key,
      value: properties[key]
    }))
    this.spaceWidth = textMeasurement.measureText(' ').width
    this.colonWidth = textMeasurement.measureText(':').width
    const maxWidth = (selector) => {
      if (this.properties.length === 0) return 0
      return Math.max(...this.properties.map(property => {
        return textMeasurement.measureText(selector(property)).width
      }))
    }
    this.keysWidth = maxWidth(property => property.key) + this.spaceWidth
    this.valuesWidth = maxWidth(property => property.value) + this.spaceWidth
    this.boxWidth = this.keysWidth + this.colonWidth + this.spaceWidth + this.valuesWidth
    this.boxHeight = this.lineHeight * this.properties.length
  }

  get isEmpty() {
    return this.properties.length === 0
  }

  draw(ctx) {
    ctx.save()

    ctx.font = this.font
    ctx.fillStyle = this.fontColor
    ctx.textBaseline = 'middle'

    this.properties.forEach((property, index) => {
      const yPosition = (index + 0.5) * this.lineHeight
      if (this.editing) {
        drawTextLine(ctx, ':', new Point(this.keysWidth + this.colonWidth, yPosition), 'end')
      } else {
        drawTextLine(ctx, property.key + ':', new Point(this.keysWidth + this.colonWidth, yPosition), 'end')
        drawTextLine(ctx, property.value, new Point(this.keysWidth + this.colonWidth + this.spaceWidth, yPosition), 'start')
      }
    })

    ctx.restore()
  }

  drawSelectionIndicator(ctx) {
    const indicatorWidth = 10
    const boundingBox = this.boundingBox()

    ctx.save()

    ctx.strokeStyle = this.editing ? selectionHandle : selectionBorder
    ctx.lineWidth = indicatorWidth
    ctx.lineJoin = 'round'
    ctx.rect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height, 0, false, true)

    ctx.restore()
  }

  boundingBox() {
    return new BoundingBox(0, this.boxWidth, 0, this.boxHeight)
  }
}
