import {drawTextLine} from "./canvasRenderer";
import {splitIntoLines} from "./utils/circleWordWrap";
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

  draw(position, radius, ctx) {
    ctx.save()

    ctx.fillStyle = this.fontColor
    ctx.font = {
      fontWeight: this.fontWeight,
      fontSize: this.fontSize,
      fontFace: this.fontFace
    }
    ctx.textBaseline = 'middle'

    const measureWidth = (string) => ctx.measureText(string).width;
    const lines = splitIntoLines(this.caption, radius, measureWidth, this.fontSize)

    const lineDistance = this.fontSize
    let yPos = -((lines.length - 1) * lineDistance) / 2
    for (let line of lines) {
      drawTextLine(ctx, line, position.translate(new Vector(0, yPos)), 'center')
      yPos += lineDistance
    }

    ctx.restore()
  }
}