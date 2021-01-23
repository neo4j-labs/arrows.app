import { Vector } from "../model/Vector";
import Pill from "./Pill";
import {combineBoundingBoxes} from "./utils/BoundingBox";

export class NodeLabelsOutsideNode {
  constructor(labels, orientation, verticalPosition, editing, style, textMeasurement) {
    this.pills = labels.map((label) => {
      return new Pill(label, editing, style, textMeasurement)
    })

    if (labels.length > 0) {
      const margin = style('label-margin')
      const lineHeight = this.pills[0].height + margin + this.pills[0].borderWidth

      this.pillPositions = this.pills.map((pill, i) => {
        const pillWidth = pill.width + pill.borderWidth
        const horizontalPosition = (() => {
          switch (orientation.horizontal) {
            case 'start':
              return 0
            case 'center':
              return -pillWidth / 2
            case 'end':
              return -pillWidth
          }
        })()
        return new Vector(
          horizontalPosition,
          verticalPosition + i * lineHeight
        )
      })
    }

    this.width = Math.max(...this.pills.map(pill => pill.width + pill.borderWidth))
    const lastPillIndex = this.pills.length - 1
    this.height = this.pillPositions[lastPillIndex].dy +
      this.pills[lastPillIndex].height + this.pills[lastPillIndex].borderWidth -
      verticalPosition
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