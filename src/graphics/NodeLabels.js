import { Vector } from "../model/Vector";
import {distribute} from "./circumferentialDistribution";
import {textAlignmentAtAngle} from "./circumferentialTextAlignment";
import Pill from "./Pill";

export class NodeLabels {
  constructor(labels, nodeRadius, nodePosition, obstacles, style, textMeasurement) {
    this.angle = distribute([
      {preferredAngles: [Math.PI / 4, 3 * Math.PI / 4, -Math.PI * 3 / 4, -Math.PI / 4], payload: 'labels'}
    ], obstacles)[0].angle
    this.alignment = textAlignmentAtAngle(this.angle)
    this.font = {
      fontWeight: 'normal',
      fontSize: style('label-font-size'),
      fontFace: 'sans-serif'
    }
    textMeasurement.font = this.font

    const backgroundColor = style('label-background-color')
    const strokeColor = style('label-border-color')
    const fontColor = style('label-color')
    const borderWidth = style('label-border-width')
    const padding = style('label-padding')
    const margin = style('label-margin')
    const pillHeight = this.font.fontSize + padding * 2 + borderWidth
    const pillRadius = pillHeight / 2
    const lineHeight = pillHeight + margin + borderWidth

    this.pills = labels.map((label, i) => {
      const pillWidth = textMeasurement.measureText(label).width
      let pillPosition = nodePosition.translate(new Vector(nodeRadius, 0).rotate(this.angle))
      if (this.alignment.vertical === 'bottom') {
        pillPosition = pillPosition.translate(new Vector(0, -lineHeight * (labels.length - 1)))
      }
      pillPosition = pillPosition.translate(new Vector(
        this.alignment.horizontal === 'right' ? -pillRadius - pillWidth : -pillRadius,
        i * lineHeight - pillRadius
      ))
      return new Pill(label, pillPosition, pillWidth, pillRadius, borderWidth, backgroundColor, strokeColor, fontColor)
    })
  }

  draw(ctx) {
    ctx.save()

    ctx.font = this.font
    ctx.textBaseline = 'middle'

    this.pills.forEach((pill) => {
      pill.draw(ctx)
    })
    ctx.restore()
  }

  boundingBox() {
    return this.pills
      .map(pill => pill.boundingBox())
      .reduce((accumulator, value) => accumulator ? accumulator.combine(value) : value, null)
  }
}