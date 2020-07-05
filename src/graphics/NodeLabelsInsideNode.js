import { Vector } from "../model/Vector";
import Pill from "./Pill";
import {combineBoundingBoxes} from "./utils/BoundingBox";

export class NodeLabelsInsideNode {
  constructor(labels, verticalPosition, editing, style, textMeasurement) {

    this.pills = labels.map((label) => {
      return new Pill(label, editing, style, textMeasurement)
    })

    const margin = style('label-margin')
    let yPos = verticalPosition

    this.pillPositions = []
    for (let i = 0; i < this.pills.length; i++) {
      const pill = this.pills[i]
      this.pillPositions[i] = new Vector(
        -pill.width / 2,
        yPos
      )
      yPos += (pill.height + pill.borderWidth + margin)
    }

    this.width = this.pills.reduce((width, pill) => Math.max(width, pill.width), 0)
    this.height = this.pills.reduce((sum, pill) => sum + pill.height, 0) +
      margin * (this.pills.length - 1)
  }

  get isInside() {
    return true
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