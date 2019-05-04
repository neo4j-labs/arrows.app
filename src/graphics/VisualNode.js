import {drawCaption, drawCircle, drawSolidCircle, drawTextLine} from "./canvasRenderer";
import {getLines} from "./utils/wordwrap";
import config from './config'
import get from 'lodash.get'
import { Vector } from "../model/Vector";
import { getStyleSelector } from "../selectors/style";
import { nodeStyleAttributes } from "../model/styling";
import {NodeLabels} from "./NodeLabels";

export default class VisualNode {
  constructor(node, graph) {
    this.node = node

    nodeStyleAttributes.forEach(styleAttribute => {
      this[styleAttribute] = getStyleSelector(node, styleAttribute)(graph)
    })

    this.style = styleAttribute => getStyleSelector(node, styleAttribute)(graph)
    if (node.labels && node.labels.length > 0) {
      this.labels = new NodeLabels(node.labels, this.style)
    }
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

    const { caption } = this.node
    drawSolidCircle(ctx, this.position, this['node-color'], this.radius)

    if (this['border-width'] > 0) {
      this.drawBorder(ctx)
    }

    if (caption) {
      this.drawCaption(ctx, this.position, caption, this.radius * 2, config)
    }
    if (this.labels) {
      this.labels.draw(this.position, this.radius, ctx)
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
}