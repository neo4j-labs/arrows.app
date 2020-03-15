import {Point} from "../model/Point";
import BoundingBox from "./utils/BoundingBox";
import {drawTextLine} from "./canvasRenderer";

export class PropertiesBox {
  constructor(properties, style, textMeasurement) {
    this.font = {
      fontWeight: style('property-font-weight'),
      fontSize: style('property-font-size'),
      fontFace: 'sans-serif'
    }
    textMeasurement.font = this.font
    this.fontColor = style('property-color')
    this.lineHeight = this.font.fontSize * 1.2
    this.properties = Object.keys(properties).map(key => ({
      key: ` ${key}:`,
      value: `${properties[key]} `
    }))
    this.keysWidth = Math.max(...this.properties.map(property => textMeasurement.measureText(property.key).width))
    this.spaceWidth = textMeasurement.measureText(' ').width
    this.valuesWidth = Math.max(...this.properties.map(property => textMeasurement.measureText(property.value).width))
    this.boxWidth = this.keysWidth + this.spaceWidth + this.valuesWidth
    this.boxHeight = this.lineHeight * this.properties.length
  }

  draw(ctx) {
    ctx.save()

    ctx.font = this.font
    ctx.fillStyle = this.fontColor
    ctx.textBaseline = 'middle'

    this.properties.forEach((property, index) => {
      const yPosition = (index + 0.5) * this.lineHeight
      drawTextLine(ctx, property.key, new Point(this.keysWidth, yPosition), 'end')
      drawTextLine(ctx, property.value, new Point(this.keysWidth + this.spaceWidth, yPosition), 'start')
    })

    ctx.restore()
  }

  boundingBox() {
    return new BoundingBox(0, this.boxWidth, 0, this.boxHeight)
  }
}
