import { Vector } from "../model/Vector";
import {distribute} from "./circumferentialDistribution";
import {textAlignmentAtAngle} from "./circumferentialTextAlignment";

export class NodeLabels {
  constructor(labels, obstacles, style) {
    this.labels = labels
    this.angle = distribute([
      {preferredAngles: [Math.PI / 4, 3 * Math.PI / 4, -Math.PI * 3 / 4, -Math.PI / 4], payload: 'labels'}
    ], obstacles)[0].angle
    this.alignment = textAlignmentAtAngle(this.angle)
    this.fontSize = style('label-font-size')
    this.fontColor = style('label-color')
    this.backgroundColor = style('label-background-color')
    this.strokeColor = style('label-border-color')
    this.borderWidth = style('label-border-width')
    this.fontFace = 'sans-serif'
    this.padding = style('label-padding')
    this.margin = style('label-margin')
  }

  draw(position, radius, ctx) {
    ctx.save()

    ctx.font = {
      fontWeight: 'normal',
      fontSize: this.fontSize,
      fontFace: this.fontFace
    }
    ctx.textBaseline = 'middle'
    const widths = this.labels.map(label => ctx.measureText(label).width)

    const pillHeight = this.fontSize + this.padding * 2 + this.borderWidth
    const pillRadius = pillHeight / 2
    const lineHeight = pillHeight + this.margin + this.borderWidth
    ctx.translate(...position.translate(new Vector(radius, 0).rotate(this.angle)).xy)
    ctx.translate(0, this.alignment.vertical === 'bottom' ? -lineHeight * (this.labels.length - 1) : 0)

    this.labels.forEach((label, i) => {
      ctx.save()
      ctx.translate(this.alignment.horizontal === 'right' ? -pillRadius - widths[i] : -pillRadius, i * lineHeight - pillRadius)
      ctx.beginPath()
      ctx.moveTo(pillRadius, 0)
      ctx.lineTo(pillRadius + widths[i], 0)
      ctx.arc(pillRadius + widths[i], pillRadius, pillRadius, -Math.PI / 2, Math.PI / 2)
      ctx.lineTo(pillRadius, pillHeight)
      ctx.arc(pillRadius, pillRadius, pillRadius, Math.PI / 2, -Math.PI / 2)
      ctx.closePath()
      ctx.fillStyle = this.backgroundColor
      ctx.fill()
      if (this.borderWidth > 0) {
        ctx.strokeStyle = this.strokeColor
        ctx.lineWidth = this.borderWidth
        ctx.stroke()
      }
      ctx.fillStyle = this.fontColor
      ctx.fillText(label, pillRadius, pillRadius)
      ctx.restore()
    })
    ctx.restore()
  }
}