import {drawTextLine} from "./canvasRenderer";
import {fitTextToCircle} from "./utils/circleWordWrap";
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
    const lineHeight = this.fontSize * 1.2
    const layout = fitTextToCircle(this.caption, radius, measureWidth, lineHeight)

    for (let i = 0; i< layout.lines.length; i++) {
      const yPos = layout.top + (i + 0.5) * lineHeight
      drawTextLine(ctx, layout.lines[i], position.translate(new Vector(0, yPos)), 'center')
    }

    ctx.restore()
  }
}