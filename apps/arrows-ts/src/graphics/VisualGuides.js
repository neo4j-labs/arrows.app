/*
 * Collection of graph-embellishments that help the user to understanding snapping behaviour
 */
import {drawDashedCircle, drawSolidRectangle, drawDashedLine} from "./canvasRenderer";
import { Point } from "../model-old/Point";
import {Vector} from "../model-old/Vector";
import {grey, red, selectionHandle} from "../model-old/colors";
import {handleSize} from "./TransformationHandles";
import {adaptForBackground} from "./backgroundColorAdaption";

export class VisualGuides {
  constructor(visualGraph, guides) {
    this.guides = guides
    const style = key => visualGraph.style[key]
    this.lineColor = adaptForBackground(red, style)
    this.handleColor = adaptForBackground(selectionHandle, style)
    this.actualPositionColor = adaptForBackground(grey, style)
  }

  draw(ctx, displayOptions) {
    const transform = (position) => displayOptions.viewTransformation.transform(position)
    const scale = displayOptions.viewTransformation.scale

    this.guides.guidelines.forEach(guideline => {
      switch (guideline.type) {
        case 'HORIZONTAL':
          const y = transform(new Point(0, guideline.y)).y
          drawDashedLine(ctx, new Point(0, y), new Point(displayOptions.canvasSize.width, y), this.lineColor)
          break

        case 'VERTICAL':
          const x = transform(new Point(guideline.x, 0)).x
          drawDashedLine(ctx, new Point(x, 0), new Point(x, displayOptions.canvasSize.height), this.lineColor)
          break

        case 'LINE':
          const point = transform(guideline.center)
          const diagonal = displayOptions.canvasSize.width + displayOptions.canvasSize.height
          const vector = new Vector(diagonal, 0).rotate(guideline.angle)
          drawDashedLine(ctx, point.translate(vector.invert()), point.translate(vector), this.lineColor)
          break

        case 'CIRCLE':
          drawDashedCircle(ctx, transform(guideline.center), guideline.radius * scale, this.lineColor)
          break

        case 'HANDLE':
          const centeringVector = new Vector(-handleSize / 2, -handleSize / 2);
          const topLeft = transform(guideline.handlePosition).translate(centeringVector)
          drawSolidRectangle(ctx, topLeft, handleSize, handleSize, 3, this.handleColor)
          break

        default:
          console.warn("Don't know how to render guideline of type: ", guideline.type)
      }
    })
  }

  drawActualPosition (ctx, displayOptions) {
    if (this.guides.naturalPosition) {
      const transform = (position) => displayOptions.viewTransformation.transform(position)
      const transformedPosition = transform(this.guides.naturalPosition)
      ctx.fillStyle = this.actualPositionColor
      ctx.circle(transformedPosition.x, transformedPosition.y, this.guides.naturalRadius * displayOptions.viewTransformation.scale, true, false)
    }
  }
}