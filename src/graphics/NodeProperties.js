import {Vector} from "../model/Vector";
import {drawTextLine} from "./canvasRenderer";
import {distribute} from "./circumferentialDistribution";
import {textAlignmentAtAngle} from "./circumferentialTextAlignment";

export class NodeProperties {
  constructor(properties, radius, nodePosition, obstacles, style, textMeasurement) {
    this.angle = distribute([
      {preferredAngles: [Math.PI / 2, -Math.PI / 2, 0, Math.PI, Math.PI / 4, 3 * Math.PI / 4, -Math.PI * 3 / 4, -Math.PI / 4], payload: 'properties'}
    ], obstacles)[0].angle
    this.alignment = textAlignmentAtAngle(this.angle)
    this.font = {
      fontWeight: style('property-font-weight'),
      fontSize: style('property-font-size'),
      fontFace: 'sans-serif'
    }
    textMeasurement.font = this.font
    this.fontColor = style('property-color')

    this.radius = radius
    this.nodePosition = nodePosition
    this.lineHeight = this.font.fontSize * 1.2
    this.properties = Object.keys(properties).map(key => ({
      key: ` ${key}:`,
      value: `${properties[key]} `
    }))
    this.boxHeight = this.lineHeight * this.properties.length
    this.keysWidth = Math.max(...this.properties.map(property => textMeasurement.measureText(property.key).width))
    this.spaceWidth = textMeasurement.measureText(' ').width
    this.valuesWidth = Math.max(...this.properties.map(property => textMeasurement.measureText(property.value).width))
  }

  draw(ctx) {
    ctx.save()

    ctx.font = this.font
    ctx.fillStyle = this.fontColor
    ctx.textBaseline = 'middle'

    const attachedAt = this.nodePosition.translate(new Vector(1, 0).rotate(this.angle).scale(this.radius))
    const start = attachedAt.translate(new Vector(20, 0).rotate(this.angle))
    const end = start.translate(new Vector(0, this.alignment.vertical === 'top' ? this.boxHeight : -this.boxHeight))

    const topTextPoint = (this.alignment.vertical === 'top' ? start : end)
      .translate(new Vector(this.alignment.horizontal === 'right' ? -(this.valuesWidth + this.spaceWidth) : this.keysWidth, 0))

    if (this.properties.length > 0) {
      ctx.strokeStyle = 'black'
      ctx.polyLine([
        attachedAt,
        start,
        end
      ])

      this.properties.forEach((property, index) => {
        const propertyPosition = topTextPoint.translate(new Vector(0, (index + 0.5) * this.lineHeight))
        drawTextLine(ctx, property.key, propertyPosition, 'end')
        drawTextLine(ctx, property.value, propertyPosition.translate(new Vector(this.spaceWidth, 0)), 'start')
      })
    }

    ctx.restore()
  }
}
