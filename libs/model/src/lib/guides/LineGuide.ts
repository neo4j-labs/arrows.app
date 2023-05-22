import {intersectLineAndCircle, intersectLineAndLine} from "./intersections";
import {Point} from "../Point";
import {coLinearIntervals} from "./intervals";
import {byAscendingError} from "./guides";
import { AnyGuide } from "./AnyGuide";
import { CircleGuide } from "./CircleGuide";

export class LineGuide {
  center: Point;
  angle: number;
  error: number;
  constructor(center:Point, angle:number, naturalPosition:Point) {
    this.center = center
    this.angle = angle
    this.error = this.calculateError(naturalPosition)
  }

  get type() {
    return 'LINE'
  }

  calculateError(naturalPosition:Point) {
    const yAxisPoint = naturalPosition.translate(this.center.vectorFromOrigin().invert()).rotate(-this.angle)
    return Math.abs(yAxisPoint.y)
  }

  snap(naturalPosition:Point) {
    return this.point(this.scalar(naturalPosition))
  }

  scalar(position:Point) {
    const xAxisPoint = position.translate(this.center.vectorFromOrigin().invert()).rotate(-this.angle)
    return xAxisPoint.x
  }

  point(scalar:number) {
    return new Point(scalar, 0).rotate(this.angle).translate(this.center.vectorFromOrigin())
  }

  combine(otherGuide:AnyGuide, naturalPosition:Point) {
    switch (otherGuide.type) {
      case 'LINE':
        // return intersectLineAndLine(this, otherGuide, naturalPosition) // ABK naturalPosition?
        return intersectLineAndLine(this, otherGuide as LineGuide)

      case 'CIRCLE':
        return intersectLineAndCircle(this, otherGuide as CircleGuide, naturalPosition)

      default:
        throw Error('unknown Guide type: ' + otherGuide.type)
    }
  }

  intervalGuide(nodes:{position:Point}[], naturalPosition:Point) {
    const otherNodesOnGuide = nodes
      .filter((node) => this.calculateError(node.position) < 0.01)
      .map(node => this.scalar(node.position));
    const intervals = coLinearIntervals(this.scalar(naturalPosition), otherNodesOnGuide)
    intervals.sort(byAscendingError)
    if (intervals.length > 0) {
      const interval = intervals[0]
      return new LineGuide(this.point(interval.candidate), this.angle + Math.PI / 2, naturalPosition)
    }
    return null
  }
}