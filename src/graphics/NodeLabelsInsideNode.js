import { Vector } from "../model/Vector";
import Pill from "./Pill";
import {combineBoundingBoxes} from "./utils/BoundingBox";

export class NodeLabelsInsideNode {
  constructor(labels, nodePosition, nodeRadius, scaleFactor, verticalAlignment, otherComponents, editing, style, textMeasurement) {

    this.nodePosition = nodePosition
    this.scaleFactor = scaleFactor

    this.pills = labels.map((label) => {
      return new Pill(label, editing, style, textMeasurement)
    })

    if (labels.length > 0) {
      const nodePadding = style('node-padding')
      const margin = scaleFactor * style('label-margin')
      const firstPill = this.pills[0]
      const lastPill = this.pills[this.pills.length - 1]
      const lineHeight = scaleFactor * (firstPill.height + firstPill.borderWidth) + margin
      const totalHeight = scaleFactor * (firstPill.height + firstPill.borderWidth) * this.pills.length +
        margin * (this.pills.length - 1)
      const effectiveRadius = nodeRadius - scaleFactor * (lastPill.radius - lastPill.borderWidth / 2) - Math.max(nodePadding, margin)

      let firstLabelTop = 0
      switch (verticalAlignment) {
        case 'top':
          const dTop = Math.sqrt(Math.max(0, effectiveRadius ** 2 - (scaleFactor * firstPill.textWidth / 2) ** 2))
          firstLabelTop = -dTop - scaleFactor * (firstPill.radius - firstPill.borderWidth)
          break

        case 'bottom':
          const dBottom = Math.sqrt(Math.max(0, effectiveRadius ** 2 - (scaleFactor * lastPill.textWidth / 2) ** 2))
          firstLabelTop = dBottom - totalHeight + scaleFactor * (lastPill.radius - lastPill.borderWidth)
          break

        default:
          firstLabelTop = (firstPill.borderWidth - totalHeight) / 2
          if (otherComponents.length > 0) {
            const otherComponent = otherComponents[0] // assume there is only one for now
            const lowerBound = otherComponent.boundingBox().top
            const nodeCentreOffset = lowerBound - nodePosition.y
            firstLabelTop -= nodeCentreOffset / 4
          }
      }

      this.pillPositions = this.pills.map((pill, i) => {
        return new Vector(
          -scaleFactor * pill.width / 2,
          firstLabelTop + i * lineHeight
        )
      })

      this.contentsFit = this.pills.every((pill, i) => {
        const y = this.pillPositions[i].dy + scaleFactor * pill.height / 2
        const r = nodeRadius - Math.max(nodePadding, margin)
        return scaleFactor * pill.radius < nodeRadius && scaleFactor * pill.width / 2 < Math.sqrt(r ** 2 - y ** 2)
      })
    } else {
      this.contentsFit = true
    }
  }

  get isEmpty() {
    return this.pills.length === 0
  }

  draw(ctx) {
    for (let i = 0; i < this.pills.length; i++) {
      ctx.save()

      ctx.translate(...this.nodePosition.translate(this.pillPositions[i]).xy)
      ctx.scale(this.scaleFactor)
      this.pills[i].draw(ctx)

      ctx.restore()
    }
  }

  drawSelectionIndicator(ctx) {
    for (let i = 0; i < this.pills.length; i++) {
      ctx.save()

      ctx.translate(...this.nodePosition.translate(this.pillPositions[i]).xy)
      ctx.scale(this.scaleFactor)
      this.pills[i].drawSelectionIndicator(ctx)

      ctx.restore()
    }
  }

  boundingBox() {
    return combineBoundingBoxes(this.pills.map((pill, i) => pill.boundingBox()
      .translate(this.nodePosition.vectorFromOrigin())
      .translate(this.pillPositions[i])))
  }

  distanceFrom(point) {
    return this.pills.some((pill, i) => {
      const localPoint = point.translate(this.nodePosition.vectorFromOrigin().invert())
        .translate(this.pillPositions[i].invert())
      return pill.contains(localPoint);
    }) ? 0 : Infinity
  }
}