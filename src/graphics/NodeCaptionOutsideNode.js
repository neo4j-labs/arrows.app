import {drawTextLine} from "./canvasRenderer";
import config from './config'
import get from 'lodash.get'
import { Vector } from "../model/Vector";

export class NodeCaptionOutsideNode {
  constructor(caption, nodePosition, radius, style) {
    this.caption = caption
    this.nodePosition = nodePosition
    this.fontSize = style('caption-font-size')
    this.fontColor = style('caption-color')
    this.fontWeight = style('caption-font-weight')
    this.fontFace = get(config, 'font.face')
    this.angle = 0
    this.attachedAt = this.nodePosition.translate(new Vector(1, 0).rotate(this.angle).scale(radius))
  }

  draw(ctx) {
    ctx.save()

    ctx.fillStyle = this.fontColor
    ctx.font = {
      fontWeight: this.fontWeight,
      fontSize: this.fontSize,
      fontFace: this.fontFace
    }
    ctx.textBaseline = 'middle'

    const lineHeight = this.fontSize * 1.2
    const layout = {
      lines: [this.caption]
    }

    for (let i = 0; i< layout.lines.length; i++) {
      const yPos = (i + 0.5 - layout.lines.length / 2) * lineHeight
      drawTextLine(ctx, layout.lines[i], this.attachedAt.translate(new Vector(0, yPos)), 'start')
    }

    ctx.restore()
  }
}