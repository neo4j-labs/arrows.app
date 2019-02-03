import {Vector} from "../model/Vector";
import {drawStraightLine, drawTextLine} from "./canvasRenderer";
import {getLines} from "./utils/wordwrap";
import config from './config'
import get from 'lodash.get'

export const drawAnnotation = (ctx, visualNode, relationshipBundles) => {
  const position = visualNode.position
  let boxAngle = 0
  let orientation = null
  let textStart = null
  let textSide = null
  const fontSize = visualNode['property-font-size'] * visualNode.viewTransformation.scale
  const fontColor = visualNode['property-color']
  const fontFace = get(config, 'font.face')
  const lineHeight = fontSize
  const maxLineWidth = lineHeight * 10

  if (relationshipBundles && relationshipBundles.length === 1) {
    const relationship = relationshipBundles[0].routedRelationships[0].relationship
    let angle = relationshipBundles[0].routedRelationships[0].arrow.angle
    if (relationship.to.id === visualNode.id) {
      angle = angle - Math.PI
    }

    boxAngle = angle + Math.PI
    if (boxAngle > Math.PI) {
      boxAngle = boxAngle - 2 * Math.PI
    }
  } else if (relationshipBundles && relationshipBundles.length > 1) {
    // Sort the points around circle
    const angles = relationshipBundles.map(relationshipBundle => {
      const relationship = relationshipBundle.routedRelationships[0].relationship
      let angle = relationshipBundle.routedRelationships[0].arrow.angle
      if (angle <= 0) {
        angle += 2 * Math.PI
      }

      if (relationship.to.id === visualNode.id) {
        angle = Math.PI > angle > 0 ? angle + Math.PI : angle - Math.PI
      }

      // convert to degrees for convenience
      return angle * 180 / Math.PI
    })
      .sort((angle1, angle2) => angle1 - angle2)

    let maxAngle = -1
    let maxArc = null

    for (let i = 0; i < angles.length; i++) {
      const angle1 = angles[i]
      const pointZeroCross = i === angles.length - 1
      let nextPoint

      if (pointZeroCross) {
        nextPoint = 0
      } else {
        nextPoint = i + 1
      }

      const angle2 = angles[nextPoint]

      let angle = pointZeroCross
        ? (360 - angle1) + angle2
        : angle2 - angle1

      if (angle > maxAngle) {
        maxAngle = angle
        maxArc = {
          startAngle: angle1,
          endAngle: angle2,
          arcAngle: angle,
          pointZeroCross
        }
      }
    }

    if (maxArc) {
      let midAngle = maxArc.pointZeroCross
        ? (maxArc.arcAngle / 2) - (360 - maxArc.startAngle)
        : maxArc.startAngle + maxArc.arcAngle / 2

      boxAngle = midAngle * Math.PI / 180
      if (boxAngle > Math.PI) {
        boxAngle -= 2 * Math.PI
      }
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
    boxAngle = -Math.PI / 2
    orientation = 'vertical'
    textStart = 'end'
    textSide = 'right'
  }

  let boxVector = new Vector(Math.cos(boxAngle), Math.sin(boxAngle)).unit()

  const properties = Object.keys(visualNode.node.properties).map(key => ({key, value: visualNode.node.properties[key]}))

  const lines = []
  properties.forEach(property => {
    const singlePropertyLines = getLines(ctx, `${property.key}: ${property.value}`, fontFace, fontSize, maxLineWidth, false)
    singlePropertyLines.forEach(line => lines.push(line))
  })

  const attachedAt = position.translate(boxVector.scale(visualNode.radius))

  if (!orientation || !textStart) {
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

  const boxHeight = (lineHeight * lines.length)
  const boxWidth = maxLineWidth

  const start = attachedAt.translate(boxVector.scale(visualNode.radius / 2))
  const end = start.translate(new Vector(orientation === 'vertical' ? 0 : (textStart === 'start' ? boxWidth : -boxWidth),
    orientation === 'vertical' ? (textStart === 'start' ? boxHeight : -boxHeight) : 0))

  const topTextPoint = (textStart === 'start' ? start : end)
    .translate(new Vector((textSide === 'left' && orientation === 'vertical') ? -boxWidth : 0, 0))

  if (lines.length > 0) {
    drawStraightLine(ctx, attachedAt, start)
    drawStraightLine(ctx, start, end)

    const textAlignment = (textSide === 'left' && orientation === 'vertical')
    || (textSide === 'right' && orientation === 'horizontal') ? 'right' : 'left'


    lines.forEach((line, index) => {
      const dx = textAlignment === 'left' ? fontSize / 5 : -fontSize / 5
      const dy = (lineHeight * (index + .5))
      drawPropertyLine(ctx, fontSize, fontColor, fontFace, topTextPoint.translate(new Vector(dx, dy)), line, boxWidth, textAlignment)
    })
  }
}

const drawPropertyLine = (ctx, fontSize, fontColor, fontFace, position, line, boxWidth, align = 'left') => {
  ctx.save()

  ctx.fillStyle = fontColor
  let fontWeight = 'normal' // this.boldText ? 'bold ' : 'normal '
  ctx.font = fontWeight + fontSize + 'px ' + fontFace
  ctx.textBaseline = 'middle'

  const offsetX = align === 'left' ? 0 : (boxWidth - ctx.measureText(line).width)
  drawTextLine(ctx, line, position.translate(new Vector(offsetX, 0)), false)

  ctx.restore()
}