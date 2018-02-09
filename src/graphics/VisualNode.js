import {drawCaption, drawSolidCircle, drawTextLine} from "./canvasRenderer";
import {getLines} from "./utils/wordwrap";
import config from './config'
import get from 'lodash.get'

export default class VisualNode {
  constructor(node, viewTransformation) {
    this.node = node
    this.viewTransformation = viewTransformation
    this.edges = []
    this.edgeMap = {}
  }

  addEdge (edge, direction) {
    this.edges.push(edge)
    this.edgeMap[edge.id] = {
      edge,
      direction
    }
  }

  get id () {
    return this.node.id.value
  }

  get x () {
    if (this.viewTransformation) {
      return this.viewTransformation.transform(this.node.position).x
    } else {
      return this.node.position.x
    }
  }

  get y () {
    if (this.viewTransformation) {
      return this.viewTransformation.transform(this.node.position).y
    } else {
      return this.node.position.y
    }
  }

  get position() {
    return this.viewTransformation.transform(this.node.position)
  }

  get radius () {
    return this.node.radius
  }

  distanceToBorder () {
    return this.radius
  }

  draw(ctx) {
    const { color, radius, caption } = this.node
    drawSolidCircle(ctx, this.position, color, radius)
    if (caption) {
      this.drawCaption(ctx, this.position, caption, radius * 2, config)
    }
  }

  drawCaption(ctx, position, label, maxWidth, config) {
    const fontSize = get(config, 'font.size')
    const fontColor = get(config, 'color.fill')
    const fontFace = get(config, 'font.face')

    let lines = getLines(ctx, label, fontFace, fontSize, maxWidth, false)//this.hasIcon)

    ctx.fillStyle = fontColor
    let fontWeight = 'normal' // this.boldText ? 'bold ' : 'normal '
    ctx.font = fontWeight + fontSize + 'px ' + fontFace

    const lineDistance = 1 + fontSize
    const totalHeight = (lines.length - 2) * lineDistance
    let yPos = -totalHeight / 2
    for (let line of lines) {
      drawTextLine(ctx, line, position.translate(0, yPos));
      yPos += lineDistance
    }
  }
}