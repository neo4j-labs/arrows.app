import {Point} from "../model/Point";
import BoundingBox from "./utils/BoundingBox";
import {drawTextLine} from "./canvasRenderer";
import {selectionBorder, selectionHandle} from "../model/colors";
import {adaptForBackground} from "./backgroundColorAdaption";

export class PropertiesBox {
  constructor(properties, editing, style, textMeasurement) {
    this.editing = editing
    this.font = {
      fontWeight: style('property-font-weight'),
      fontSize: style('property-font-size'),
      fontFamily: style('font-family')
    }
    textMeasurement.font = this.font
    this.fontColor = style('property-color')
    this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style)
    this.lineHeight = this.font.fontSize * 1.2
    this.alignment = style('property-alignment')
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

    switch (this.editing ? 'colon' : this.alignment) {
      case 'colon':
        this.keysWidth = maxWidth(property => property.key) + this.spaceWidth
        this.valuesWidth = maxWidth(property => property.value) + this.spaceWidth
        this.boxWidth = this.keysWidth + this.colonWidth + this.spaceWidth + this.valuesWidth
        break

      case 'center':
        this.boxWidth = maxWidth(property => property.key + ': ' + property.value)
        break
    }
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
        switch (this.alignment) {
          case 'colon':
            drawTextLine(ctx, property.key + ':', new Point(this.keysWidth + this.colonWidth, yPosition), 'end')
            drawTextLine(ctx, property.value, new Point(this.keysWidth + this.colonWidth + this.spaceWidth, yPosition), 'start')
            break

          case 'center':
            drawTextLine(ctx, property.key + ': ' + property.value, new Point(this.boxWidth / 2, yPosition), 'center')
            break
        }
      }
    })

    ctx.restore()
  }

  drawBackground(ctx) {
    const boundingBox = this.boundingBox()
    ctx.fillStyle = 'white'
    ctx.rect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height, 0, true, false)
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

  boundingBox() {
    return new BoundingBox(0, this.boxWidth, 0, this.boxHeight)
  }
}
