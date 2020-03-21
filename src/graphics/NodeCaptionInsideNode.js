import {drawTextLine} from "./canvasRenderer";
import {fitTextToCircle} from "./utils/circleWordWrap";
import config from './config'
import get from 'lodash.get'
import { Vector } from "../model/Vector";
import BoundingBox from "./utils/BoundingBox";

export class NodeCaptionInsideNode {
  constructor(caption, nodePosition, radius, style) {
    this.caption = caption
    this.nodePosition = nodePosition
    this.radius = radius
    this.fontSize = style('caption-font-size')
    this.fontColor = style('caption-color')
    this.fontWeight = style('caption-font-weight')
    this.fontFace = get(config, 'font.face')
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

    const measureWidth = (string) => ctx.measureText(string).width;
    const lineHeight = this.fontSize * 1.2
    const layout = fitTextToCircle(this.caption, this.radius, measureWidth, lineHeight)

    for (let i = 0; i< layout.lines.length; i++) {
      const yPos = layout.top + (i + 0.5) * lineHeight
      drawTextLine(ctx, layout.lines[i], this.nodePosition.translate(new Vector(0, yPos)), 'center')
    }

    ctx.restore()
  }

  boundingBox() {
    return new BoundingBox(
      this.nodePosition.x - this.radius,
      this.nodePosition.x + this.radius,
      this.nodePosition.y - this.radius,
      this.nodePosition.y + this.radius
    )
  }
}