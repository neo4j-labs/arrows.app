/*
 * Collection of graph-embellishments that help the user to understanding snapping behaviour
 */
import { drawCircle, drawSolidCircle, drawStraightLine } from "./canvasRenderer";
import { Point } from "../model/Point";
import { defaultNodeRadius } from "./constants";

export class Guides {
  constructor(guidelines = [], naturalPosition) {
    this.guidelines = guidelines
    this.naturalPosition = naturalPosition
  }

  draw (ctx, displayOptions) {
    const transform = (position) => displayOptions.viewTransformation.transform(position)

    this.guidelines.forEach(guideline => {
      switch (guideline.type) {
        case 'HORIZONTAL':
          const y = transform(new Point(0, guideline.y)).y
          drawStraightLine(ctx, new Point(0, y), new Point(displayOptions.canvasSize.width, y))
          break

        case 'VERTICAL':
          const x = transform(new Point(guideline.x, 0)).x
          drawStraightLine(ctx, new Point(x, 0), new Point(x, displayOptions.canvasSize.height))
          break
        case 'CIRCLE':
          drawCircle(ctx, transform(guideline.center), guideline.radius, true)
      }
    })

    if (this.naturalPosition) {
      drawSolidCircle(ctx, transform(this.naturalPosition), 'grey', defaultNodeRadius)
    }
  }
}