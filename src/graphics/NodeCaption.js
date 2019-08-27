import {drawTextLine} from "./canvasRenderer";
import {getLines} from "./utils/wordwrap";
import config from './config'
import get from 'lodash.get'
import { Vector } from "../model/Vector";

export class NodeCaption {
  constructor(caption, style) {
    this.caption = caption
    this.fontSize = style('caption-font-size')
    this.fontColor = style('caption-color')
    this.fontWeight = style('caption-font-weight')
    this.fontFace = get(config, 'font.face')
  }

  draw(position, maxWidth, ctx) {
    ctx.save()

    const lines = getLines(ctx, this.caption, this.fontFace, this.fontSize, maxWidth, false)

    ctx.fillStyle = this.fontColor
    ctx.font = `${this.fontWeight} ${this.fontSize}px ${this.fontFace}`
    ctx.textBaseline = 'middle'

    const lineDistance = this.fontSize
    let yPos = -((lines.length - 1) * lineDistance) / 2
    for (let line of lines) {
      drawTextLine(ctx, line, position.translate(new Vector(0, yPos)))
      yPos += lineDistance
    }

    ctx.restore()
  }
}