/*
 * Collection of graph-embellishments that help the user to understanding snapping behaviour
 */
import { drawCircle, drawSolidCircle, drawStraightLine } from "./canvasRenderer";
import { Point } from "../model/Point";

export class Guides {
  constructor(guidelines = [], naturalPosition, naturalRadius) {
    this.guidelines = guidelines
    this.naturalPosition = naturalPosition
    this.naturalRadius = naturalRadius
  }

  drawSnaplines (ctx, displayOptions) {
    const transform = (position) => displayOptions.viewTransformation.transform(position)
    const scale = displayOptions.viewTransformation.scale

    this.guidelines.forEach(guideline => {
      switch (guideline.type) {
        case 'HORIZONTAL':
          const y = transform(new Point(0, guideline.y)).y
          drawStraightLine(ctx, new Point(0, y), new Point(displayOptions.canvasSize.width, y), {dashed: true})
          break

        case 'VERTICAL':
          const x = transform(new Point(guideline.x, 0)).x
          drawStraightLine(ctx, new Point(x, 0), new Point(x, displayOptions.canvasSize.height), {dashed: true})
          break

        case 'CIRCLE':
          drawCircle(ctx, transform(guideline.center), guideline.radius * scale, true, {dashed: true})
          break

        default:
          console.warn("Don't know how to render guideline of type: ", guideline.type)
      }
    })
  }

  drawActualPosition (ctx, displayOptions) {
    if (this.naturalPosition) {
      const transform = (position) => displayOptions.viewTransformation.transform(position)
      drawSolidCircle(ctx, transform(this.naturalPosition), 'grey', this.naturalRadius * displayOptions.viewTransformation.scale)
    }
  }
}