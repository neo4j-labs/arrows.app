import { Vector } from "../model/Vector";
import Pill from "./Pill";
import {combineBoundingBoxes} from "./utils/BoundingBox";

export class NodeLabelsInsideNode {
  constructor(labels, nodeRadius, nodePosition, verticalAlignment, otherComponents, editing, style, textMeasurement) {

    this.pills = labels.map((label) => {
      return new Pill(label, editing, style, textMeasurement)
    })

    if (labels.length > 0) {
      const margin = style('label-margin')
      const lineHeight = this.pills[0].height + margin + this.pills[0].borderWidth
      const totalHeight = (this.pills[0].height + this.pills[0].borderWidth) * this.pills.length +
        margin * (this.pills.length - 1)

        this.pillPositions = this.pills.map((pill, i) => {
        let pillPosition = nodePosition
        switch (verticalAlignment) {
          case 'bottom':
            pillPosition = pillPosition.translate(new Vector(0, nodeRadius - lineHeight * labels.length))
            break

          default:
            pillPosition = pillPosition.translate(new Vector(0, (pill.borderWidth - totalHeight) / 2))
        }
        return pillPosition.translate(new Vector(
          -pill.width / 2,
          i * lineHeight
        ))
      })
    }

    this.contentsFit = true
  }

  get isEmpty() {
    return this.pills.length === 0
  }

  draw(ctx) {

    for (let i = 0; i < this.pills.length; i++) {
      ctx.save()

      ctx.translate(...this.pillPositions[i].xy)
      this.pills[i].draw(ctx)

      ctx.restore()
    }
  }

  drawSelectionIndicator(ctx) {
    for (let i = 0; i < this.pills.length; i++) {
      ctx.save()

      ctx.translate(...this.pillPositions[i].xy)
      this.pills[i].drawSelectionIndicator(ctx)

      ctx.restore()
    }
  }

  boundingBox() {
    return combineBoundingBoxes(this.pills.map((pill, i) => pill.boundingBox().translate(this.pillPositions[i].vectorFromOrigin())))
  }

  distanceFrom(point) {
    return this.pills.some((pill, i) => {
      const localPoint = point.translate(this.pillPositions[i].vectorFromOrigin().invert())
      return pill.contains(localPoint);
    }) ? 0 : Infinity
  }
}