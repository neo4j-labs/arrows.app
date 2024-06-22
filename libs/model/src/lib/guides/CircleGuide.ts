import {
  intersectCircleAndCircle,
  intersectLineAndCircle,
} from './intersections';
import { angularIntervals } from './intervals';
import { LineGuide } from './LineGuide';
import { byAscendingError } from './guides';
import { Point } from '../Point';
import { AnyGuide } from './AnyGuide';

export class CircleGuide {
  center: Point;
  radius: number;
  error: number;
  constructor(center: Point, radius: number, naturalPosition: Point) {
    this.center = center;
    this.radius = radius;
    this.error = this.calculateError(naturalPosition);
  }

  get type() {
    // ABK: Typescript can't discriminate on this
    return 'CIRCLE';
  }

  calculateError(naturalPosition: Point) {
    const offset = naturalPosition.vectorFrom(this.center);
    return Math.abs(offset.distance() - this.radius);
  }

  snap(naturalPosition: Point) {
    const offset = naturalPosition.vectorFrom(this.center);
    return this.center.translate(offset.scale(this.radius / offset.distance()));
  }

  scalar(position: Point) {
    const offset = position.vectorFrom(this.center);
    return offset.angle();
  }

  combine(otherGuide: AnyGuide, naturalPosition: Point) {
    switch (otherGuide.type) {
      case 'LINE':
        return intersectLineAndCircle(
          otherGuide as LineGuide,
          this,
          naturalPosition
        );

      case 'CIRCLE':
        return intersectCircleAndCircle(
          this,
          otherGuide as CircleGuide,
          naturalPosition
        );

      default:
        throw Error('unknown Guide type: ' + otherGuide.type);
    }
  }

  intervalGuide(nodes: { position: Point }[], naturalPosition: Point) {
    const otherNodesOnGuide = nodes
      .filter((node) => this.calculateError(node.position) < 0.01)
      .map((node) => this.scalar(node.position));
    const intervals = angularIntervals(
      this.scalar(naturalPosition),
      otherNodesOnGuide
    );
    intervals.sort(byAscendingError);
    if (intervals.length > 0) {
      const interval = intervals[0];
      return new LineGuide(this.center, interval.candidate, naturalPosition);
    }
    return null;
  }
}
