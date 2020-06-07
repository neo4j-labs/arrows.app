import { Vector } from "../model/Vector";
import Pill from "./Pill";
import {combineBoundingBoxes} from "./utils/BoundingBox";

export class NodeLabelsInsideNode {
  constructor(labels, nodeRadius, nodePosition, verticalAlignment, otherComponents, editing, style, textMeasurement) {

    this.pills = labels.map((label) => {
      return new Pill(label, editing, style, textMeasurement)
    })

    if (labels.length > 0) {
      const nodePadding = style('node-padding')
      const margin = style('label-margin')
      const firstPill = this.pills[0]
      const lastPill = this.pills[this.pills.length - 1]
      const lineHeight = firstPill.height + margin + firstPill.borderWidth
      const totalHeight = (firstPill.height + firstPill.borderWidth) * this.pills.length +
        margin * (this.pills.length - 1)

      let firstLabelTop = 0
      switch (verticalAlignment) {
        case 'bottom':
          const effectiveRadius = nodeRadius - (lastPill.radius - lastPill.borderWidth / 2 + Math.max(nodePadding, margin))
          const d = Math.sqrt(effectiveRadius ** 2 - (lastPill.textWidth / 2) ** 2)
          firstLabelTop = d - totalHeight + lastPill.radius - lastPill.borderWidth
          break

        default:
          firstLabelTop = (firstPill.borderWidth - totalHeight) / 2
      }

      this.pillPositions = this.pills.map((pill, i) => {
        return nodePosition.translate(new Vector(
          -pill.width / 2,
          firstLabelTop + i * lineHeight
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