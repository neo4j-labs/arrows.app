import {Vector} from "../model/Vector";
import {drawStraightLine, drawTextLine} from "./canvasRenderer";
import {getLines} from "./utils/wordwrap";
import config from './config'
import get from 'lodash.get'
import {distribute} from "./circumferentialDistribution";
import {textAlignmentAtAngle} from "./circumferentialTextAlignment";

export class NodeProperties {
  constructor(properties, radius, nodePosition, obstacles, style) {
    this.properties = properties
    this.radius = radius
    this.nodePosition = nodePosition
    this.obstacles = obstacles
    this.fontSize = style('property-font-size')
    this.fontColor = style('property-color')
    this.fontWeight = style('property-font-weight')
    this.fontFace = get(config, 'font.face')
  }

  draw(ctx) {
    const position = this.nodePosition
    let boxAngle = distribute([
      {preferredAngles: [Math.PI / 2, -Math.PI / 2, 0, Math.PI, Math.PI / 4, 3 * Math.PI / 4, -Math.PI * 3 / 4, -Math.PI / 4], payload: 'properties'}
    ], this.obstacles)[0].angle
    const lineHeight = this.fontSize
    const maxLineWidth = lineHeight * 10

    const boxVector = new Vector(Math.cos(boxAngle), Math.sin(boxAngle)).unit()

    const properties = Object.keys(this.properties).map(key => ({
      key,
      value: this.properties[key]
    }))

    const lines = []
    properties.forEach(property => {
      const singlePropertyLines = getLines(ctx, `${property.key}: ${property.value}`, this.fontFace, this.fontSize, maxLineWidth, false)
      singlePropertyLines.forEach(line => lines.push(line))
    })

    if (lines.length > 0) {
      console.log(boxAngle)
    }

    const attachedAt = position.translate(boxVector.scale(this.radius))

    const alignment = textAlignmentAtAngle(boxAngle)
    const boxHeight = (lineHeight * lines.length)
    const boxWidth = maxLineWidth

    const start = attachedAt.translate(boxVector.scale(this.radius / 2))
    const end = start.translate(new Vector(0, alignment.vertical === 'top' ? boxHeight : -boxHeight))

    const topTextPoint = (alignment.vertical === 'top' ? start : end)
      .translate(new Vector(alignment.horizontal === 'right' ? -boxWidth : 0, 0))

    if (lines.length > 0) {
      drawStraightLine(ctx, attachedAt, start)
      drawStraightLine(ctx, start, end)

      lines.forEach((line, index) => {
        const dx = alignment.horizontal === 'left' ? this.fontSize / 5 : -this.fontSize / 5
        const dy = (lineHeight * (index + .5))
        drawPropertyLine(ctx, this.fontSize, this.fontColor, this.fontWeight, this.fontFace, topTextPoint.translate(new Vector(dx, dy)), line, boxWidth, alignment.horizontal)
      })
    }
  }
}

const drawPropertyLine = (ctx, fontSize, fontColor, fontWeight, fontFace, position, line, boxWidth, horizontalAlignment) => {
  ctx.save()

  ctx.fillStyle = fontColor
  ctx.font = {
    fontWeight: fontWeight,
    fontSize: fontSize,
    fontFace: fontFace
  }
  ctx.textBaseline = 'middle'

  const offsetX = horizontalAlignment === 'left' ? 0 : (boxWidth - ctx.measureText(line).width)
  drawTextLine(ctx, line, position.translate(new Vector(offsetX, 0)), false)

  ctx.restore()
}