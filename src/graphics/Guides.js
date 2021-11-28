/*
 * Collection of graph-embellishments that help the user to understanding snapping behaviour
 */
import {drawDashedCircle, drawSolidCircle, drawSolidRectangle, drawDashedLine} from "./canvasRenderer";
import { Point } from "../model/Point";
import {Vector} from "../model/Vector";
import {red, selectionHandle} from "../model/colors";
import {handleSize} from "./TransformationHandles";

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
          drawDashedLine(ctx, new Point(0, y), new Point(displayOptions.canvasSize.width, y), red)
          break

        case 'VERTICAL':
          const x = transform(new Point(guideline.x, 0)).x
          drawDashedLine(ctx, new Point(x, 0), new Point(x, displayOptions.canvasSize.height), red)
          break

        case 'LINE':
          const point = transform(guideline.center)
          const diagonal = displayOptions.canvasSize.width + displayOptions.canvasSize.height
          const vector = new Vector(diagonal, 0).rotate(guideline.angle)
          drawDashedLine(ctx, point.translate(vector.invert()), point.translate(vector), red)
          break

        case 'CIRCLE':
          drawDashedCircle(ctx, transform(guideline.center), guideline.radius * scale, true, red)
          break

        case 'HANDLE':
          const centeringVector = new Vector(-handleSize / 2, -handleSize / 2);
          const topLeft = transform(guideline.handlePosition).translate(centeringVector)
          drawSolidRectangle(ctx, topLeft, handleSize, handleSize, 3, selectionHandle)
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