import { Vector } from "../model/Vector";
import {distribute} from "./circumferentialDistribution";
import {textAlignmentAtAngle} from "./circumferentialTextAlignment";
import Pill from "./Pill";
import {combineBoundingBoxes} from "./utils/BoundingBox";

export class NodeLabelsOutsideNode {
  constructor(labels, nodeRadius, obstacles, editing, style, textMeasurement) {
    this.angle = distribute([
      {preferredAngles: [Math.PI / 4, 3 * Math.PI / 4, -Math.PI * 3 / 4, -Math.PI / 4], payload: 'labels'}
    ], obstacles)[0].angle
    this.alignment = textAlignmentAtAngle(this.angle)

    this.pills = labels.map((label) => {
      return new Pill(label, editing, style, textMeasurement)
    })

    if (labels.length > 0) {
      const margin = style('label-margin')
      const lineHeight = this.pills[0].height + margin + this.pills[0].borderWidth

      this.pillPositions = this.pills.map((pill, i) => {
        const pillWidth = pill.width + pill.borderWidth
        const pillRadius = pill.radius
        let pillPosition = new Vector(nodeRadius, 0).rotate(this.angle)
        if (this.alignment.vertical === 'bottom') {
          pillPosition = pillPosition.plus(new Vector(0, -lineHeight * (labels.length - 1)))
        }
        return pillPosition.plus(new Vector(
          this.alignment.horizontal === 'right' ? pillRadius - pillWidth : -pillRadius,
          i * lineHeight - pillRadius
        ))
      })
    }
  }

  get type() {
    return 'LABELS'
  }

  get isEmpty() {
    return this.pills.length === 0
  }

  draw(ctx) {

    for (let i = 0; i < this.pills.length; i++) {
      ctx.save()

      ctx.translate(...this.pillPositions[i].dxdy)
      this.pills[i].draw(ctx)

      ctx.restore()
    }
  }

  drawSelectionIndicator(ctx) {
    for (let i = 0; i < this.pills.length; i++) {
      ctx.save()

      ctx.translate(...this.pillPositions[i].dxdy)
      this.pills[i].drawSelectionIndicator(ctx)

      ctx.restore()
    }
  }

  boundingBox() {
    return combineBoundingBoxes(this.pills.map((pill, i) => pill.boundingBox()
      .translate(this.pillPositions[i])))
  }

  distanceFrom(point) {
    return this.pills.some((pill, i) => {
      const localPoint = point.translate(this.pillPositions[i].invert())
      return pill.contains(localPoint);
    }) ? 0 : Infinity
  }
}