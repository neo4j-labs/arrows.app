import {drawCaption, drawCircle, drawSolidCircle, drawTextLine} from "./canvasRenderer";
import {getLines} from "./utils/wordwrap";
import config from './config'
import get from 'lodash.get'
import { Vector } from "../model/Vector";
import { Point } from "../model/Point";
import { getStyleSelector } from "../selectors/style";
import { nodeStyleAttributes } from "../model/styling";

export default class VisualNode {
  constructor(node, graph) {
    this.node = node

    nodeStyleAttributes.forEach(styleAttribute => {
      this[styleAttribute] = getStyleSelector(node, styleAttribute)(graph)
    })
  }

  get id() {
    return this.node.id
  }

  get x () {
    return this.node.position.x
  }

  get y () {
    return this.node.position.y
  }

  get position() {
    return this.node.position
  }

  get status() {
    return this.node.status
  }

  get superNodeId() {
    return this.node.superNodeId
  }

  get type() {
    return this.node.type
  }

  get initialPositions () {
    return this.node.initialPositions
  }

  draw(ctx) {
    if (this.status === 'combined') {
      return
    }

    const { caption, labels } = this.node
    drawSolidCircle(ctx, this.position, this['node-color'], this.radius)

    if (this['border-width'] > 0) {
      this.drawBorder(ctx)
    }

    if (caption) {
      this.drawCaption(ctx, this.position, caption, this.radius * 2, config)
    }
    if (labels) {
      this.drawLabels(ctx, this.position, this.radius, labels)
    }
  }

  drawBorder(ctx, borderWidth) {
    const strokeWidth = borderWidth || this['border-width']
    ctx.save()
    ctx.strokeStyle = this['border-color'] || '#000'
    ctx.lineWidth = strokeWidth
    drawCircle(ctx, this.position, Math.max(strokeWidth / 2, this.radius - strokeWidth / 2), true)
    ctx.restore()
  }

  drawCaption(ctx, position, label, maxWidth, config) {
    ctx.save()
    const fontSize = this['caption-font-size']
    const fontColor = this['caption-color']
    const fontWeight = this['caption-font-weight']
    const fontFace = get(config, 'font.face')

    let lines = getLines(ctx, label, fontFace, fontSize, maxWidth, false)//this.hasIcon)

    ctx.fillStyle = fontColor
    ctx.font = `${fontWeight} ${fontSize}px ${fontFace}`
    ctx.textBaseline = 'middle'

    const lineDistance = fontSize
    let yPos = -((lines.length - 1) * lineDistance) / 2
    for (let line of lines) {
      drawTextLine(ctx, line, position.translate(new Vector(0, yPos)))
      yPos += lineDistance
    }
    ctx.restore()
  }

  drawLabels(ctx, position, radius, labels) {
    ctx.save()
    const fontSize = this['label-font-size']
    const fontColor = this['label-color']
    const backgroundColor = this['label-background-color']
    const strokeColor = this['label-border-color']
    const borderWidth = this['label-border-width']
    const fontFace = get(config, 'font.face')
    const padding = this['label-padding']
    const margin = this['label-margin']

    let fontWeight = 'normal'
    ctx.font = `${fontWeight} ${fontSize}px ${fontFace}`
    ctx.textBaseline = 'middle'

    ctx.translate(...position.translate(new Vector(radius, 0).rotate(Math.PI / 4)).xy)
    const pillHeight = fontSize + padding * 2 + borderWidth
    const pillRadius = pillHeight / 2
    const lineHeight = pillHeight + margin + borderWidth

    labels.forEach((label, i) => {
      ctx.save()
      ctx.translate(-pillRadius, i * lineHeight - pillRadius)
      const metrics = ctx.measureText(label)
      ctx.beginPath()
      ctx.moveTo(pillRadius, 0)
      ctx.lineTo(pillRadius + metrics.width, 0)
      ctx.arc(pillRadius + metrics.width, pillRadius, pillRadius, -Math.PI / 2, Math.PI / 2)
      ctx.lineTo(pillRadius, pillHeight)
      ctx.arc(pillRadius, pillRadius, pillRadius, Math.PI / 2, -Math.PI / 2)
      ctx.closePath()
      ctx.fillStyle = backgroundColor
      ctx.fill()
      if (borderWidth > 0) {
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = borderWidth
        ctx.stroke()
      }
      ctx.fillStyle = fontColor
      drawTextLine(ctx, label, new Point(pillRadius, pillRadius), false)
      ctx.restore()
    })
    ctx.restore()
  }
}