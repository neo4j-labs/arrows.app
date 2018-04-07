import { Vector } from "../model/Vector";
import { drawStraightLine, drawTextLine } from "./canvasRenderer";
import { getLines } from "./utils/wordwrap";
import config from './config'
import get from 'lodash.get'

export default (visualNode) => {
  const position = visualNode.position
  let boxAngle = 0
  let orientation = null
  let textStart = null
  let textSide = null
  const fontSize = get(config, 'font.size') * (4 / 5)
  const lineHeight = fontSize * 2

  if (visualNode.edges.length === 1) {
    const edgeAngle = Math.atan2(visualNode.edges[0].fromPoint.y - position.y, visualNode.edges[0].fromPoint.x - position.x)
    boxAngle = edgeAngle + Math.PI
    if (boxAngle > Math.PI) {
      boxAngle = boxAngle - 2 * Math.PI
    }
  } else if (visualNode.edges.length > 1) {
    // Sort the points around circle
    const arcPoints = visualNode.edges.map(edge => ({
      ...edge.fromPoint,
      type: edge.relationship.type,
      get angle() {
        let rawAngle = Math.atan2(edge.fromPoint.y - position.y, edge.fromPoint.x - position.x)
        return rawAngle < 0 ? 2 * Math.PI + rawAngle : rawAngle
      }
    }))
      .sort((point1, point2) => point1.angle - point2.angle)

    let maxAngle = -1
    let maxArc = null

    for (let i = 0; i < arcPoints.length; i++) {
      const point1 = arcPoints[i]
      const nextPoint = i === arcPoints.length - 1 ? 0 : i + 1
      const point2 = arcPoints[nextPoint]

      let angle = point2.angle - point1.angle
      if (angle < 0) {
        angle = 2 * Math.PI + angle
      }

      if (angle > maxAngle) {
        maxAngle = angle
        maxArc = { start: point1, end: point2, arcAngle: angle }
      }
    }

    if (maxArc) {
      // find midpoint in raw radians
      let midAngle = maxArc.start.angle + maxArc.arcAngle / 2
      if (midAngle > Math.PI) {
        midAngle = midAngle - 2 * Math.PI
      }
      boxAngle = midAngle
    }
  }

  const snapThreshold = 0.3
  if (Math.abs(boxAngle - 0) < snapThreshold) {
    boxAngle = 0
    orientation = 'horizontal'
    textStart = 'start'
    textSide = 'right'
  } else if (Math.abs(boxAngle - Math.PI / 2) < snapThreshold) {
    boxAngle = Math.PI / 2
    orientation = 'vertical'
    textStart = 'start'
    textSide = 'right'
  } else if (Math.abs(boxAngle - Math.PI) < snapThreshold) {
    boxAngle = Math.PI
    orientation = 'horizontal'
    textStart = 'end'
    textSide = 'left'
  } else if (Math.abs(boxAngle + Math.PI / 2) < snapThreshold) {
    boxAngle = - Math.PI / 2
    orientation = 'vertical'
    textStart = 'end'
    textSide = 'right'
  }

  let boxVector = new Vector(Math.cos(boxAngle), Math.sin(boxAngle)).unit()

  const properties = Object.keys(visualNode.node.properties).map(key => ({key, value: visualNode.node.properties[key]}))
  let maxPropertyValueLength = 0
  properties.forEach(property => {
    const length = `${property.key}: ${property.value}`.length
    if (length > maxPropertyValueLength) {
      maxPropertyValueLength = length
    }
  })

  const noOfLines = properties.length
  const attachedAt = position.translate(boxVector.scale(visualNode.radius))

  if(!orientation || !textStart) {
    if (0 <= boxAngle && boxAngle < Math.PI / 2) {
      orientation = 'vertical'
      textStart = 'start'
      textSide = 'right'
    } else if (Math.PI / 2 <= boxAngle && boxAngle < Math.PI) {
      orientation = 'vertical'
      textStart = 'start'
      textSide = 'left'
    } else if (-Math.PI <= boxAngle && boxAngle < -Math.PI / 2) {
      orientation = 'vertical'
      textStart = 'end'
      textSide = 'left'
    } else if (-Math.PI / 2 <= boxAngle && boxAngle < 0) {
      orientation = 'vertical'
      textStart = 'end'
      textSide = 'right'
    }
  }

  const maxLineWidth = 100
  const boxHeight = (lineHeight * noOfLines + 5)
  const boxWidth = Math.min(maxPropertyValueLength * 5, maxLineWidth)

  const start = attachedAt.translate(boxVector.scale(visualNode.radius / 2))
  const end = start.translate(new Vector(orientation === 'vertical' ? 0 : (textStart === 'start' ? boxWidth : - boxWidth),
    orientation === 'vertical' ? (textStart === 'start' ? boxHeight : - boxHeight) : 0))

  const topTextPoint = (textStart === 'start' ? start : end)
    .translate(new Vector((textSide === 'left' && orientation === 'vertical') ? - boxWidth : 0, 5))

  return {
    draw: (ctx) => {
      if (noOfLines > 0) {
        drawStraightLine(ctx, attachedAt, start)
        drawStraightLine(ctx, start, end)

        const textAlignment = (textSide === 'left' && orientation === 'vertical')
          || (textSide === 'right' && orientation === 'horizontal') ? 'right' : 'left'
        properties.forEach((property, index) => {
          drawProperty(ctx, topTextPoint.translate(new Vector(5, (lineHeight * index) + 5)), property, maxLineWidth, boxWidth, textAlignment)
        })
      }
    }
  }
}

const drawProperty = (ctx, position, property, maxWidth, boxWidth, align = 'left') => {
  ctx.save()

  const fontSize = get(config, 'font.size') * (4/5)
  const fontColor = get(config, 'color.fill')
  const fontFace = get(config, 'font.face')

  let lines = getLines(ctx, `${property.key}: ${property.value}`, fontFace, fontSize, maxWidth, false)

  ctx.fillStyle = fontColor
  let fontWeight = 'normal' // this.boldText ? 'bold ' : 'normal '
  ctx.font = fontWeight + fontSize + 'px ' + fontFace

  const lineDistance = 1 + fontSize
  const totalHeight = (lines.length - 2) * lineDistance
  let offsetY = -totalHeight / 2
  for (let line of lines) {
    const offsetX = align === 'left' ? 0 : (boxWidth - ctx.measureText(line).width - 10)
    drawTextLine(ctx, line, position.translate(new Vector(offsetX, offsetY)), false)
    offsetY += lineDistance
  }

  ctx.restore()
}