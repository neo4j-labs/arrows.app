import {Vector} from "../model/Vector";
import {drawStraightLine, drawTextLine} from "./canvasRenderer";
import {getLines} from "./utils/wordwrap";
import config from './config'
import get from 'lodash.get'
import {distribute} from "./circumferentialDistribution";

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
      {preferredAngles: [Math.PI / 2, Math.PI * 3 / 2, 0, Math.PI, Math.PI / 4, 3 * Math.PI / 4, -Math.PI * 3 / 4, -Math.PI / 4], payload: 'properties'}
    ], this.obstacles)[0].angle
    let textStart = null
    let textSide = null
    const lineHeight = this.fontSize
    const maxLineWidth = lineHeight * 10

    let boxVector = new Vector(Math.cos(boxAngle), Math.sin(boxAngle)).unit()

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

    if (!textStart) {
      if (0 <= boxAngle && boxAngle < Math.PI / 2) {
        textStart = 'start'
        textSide = 'right'
      } else if (Math.PI / 2 <= boxAngle && boxAngle < Math.PI) {
        textStart = 'start'
        textSide = 'left'
      } else if (Math.PI <= boxAngle && boxAngle < -Math.PI / 2) {
        textStart = 'end'
        textSide = 'left'
      } else if (-Math.PI / 2 <= boxAngle && boxAngle < 0) {
        textStart = 'end'
        textSide = 'right'
      }
    }

    const boxHeight = (lineHeight * lines.length)
    const boxWidth = maxLineWidth

    const start = attachedAt.translate(boxVector.scale(this.radius / 2))
    const end = start.translate(new Vector(0, textStart === 'start' ? boxHeight : -boxHeight))

    const topTextPoint = (textStart === 'start' ? start : end)
      .translate(new Vector(textSide === 'left' ? -boxWidth : 0, 0))

    if (lines.length > 0) {
      drawStraightLine(ctx, attachedAt, start)
      drawStraightLine(ctx, start, end)

      const textAlignment = textSide === 'left' ? 'right' : 'left'

      lines.forEach((line, index) => {
        const dx = textAlignment === 'left' ? this.fontSize / 5 : -this.fontSize / 5
        const dy = (lineHeight * (index + .5))
        drawPropertyLine(ctx, this.fontSize, this.fontColor, this.fontWeight, this.fontFace, topTextPoint.translate(new Vector(dx, dy)), line, boxWidth, textAlignment)
      })
    }
  }
}

const drawPropertyLine = (ctx, fontSize, fontColor, fontWeight, fontFace, position, line, boxWidth, align = 'left') => {
  ctx.save()

  ctx.fillStyle = fontColor
  ctx.font = `${fontWeight} ${fontSize}px ${fontFace}`
  ctx.textBaseline = 'middle'

  const offsetX = align === 'left' ? 0 : (boxWidth - ctx.measureText(line).width)
  drawTextLine(ctx, line, position.translate(new Vector(offsetX, 0)), false)

  ctx.restore()
}