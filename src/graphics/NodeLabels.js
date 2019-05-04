import { Vector } from "../model/Vector";

export class NodeLabels {
  constructor(labels, style) {
    this.labels = labels
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

    const fontWeight = 'normal'
    ctx.font = `${fontWeight} ${this.fontSize}px ${this.fontFace}`
    ctx.textBaseline = 'middle'

    ctx.translate(...position.translate(new Vector(radius, 0).rotate(Math.PI / 4)).xy)
    const pillHeight = this.fontSize + this.padding * 2 + this.borderWidth
    const pillRadius = pillHeight / 2
    const lineHeight = pillHeight + this.margin + this.borderWidth

    this.labels.forEach((label, i) => {
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