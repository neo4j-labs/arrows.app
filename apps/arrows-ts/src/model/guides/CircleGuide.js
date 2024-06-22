import {
  intersectCircleAndCircle,
  intersectLineAndCircle,
} from './intersections';
import { angularIntervals } from './intervals';
import { LineGuide } from './LineGuide';
import { byAscendingError } from './guides';

export class CircleGuide {
  constructor(center, radius, naturalPosition) {
    this.center = center;
    this.radius = radius;
    this.error = this.calculateError(naturalPosition);
  }

  get type() {
    return 'CIRCLE';
  }

  calculateError(naturalPosition) {
    const offset = naturalPosition.vectorFrom(this.center);
    return Math.abs(offset.distance() - this.radius);
  }

  snap(naturalPosition) {
    let offset = naturalPosition.vectorFrom(this.center);
    return this.center.translate(offset.scale(this.radius / offset.distance()));
  }

  scalar(position) {
    let offset = position.vectorFrom(this.center);
    return offset.angle();
  }

  combine(otherGuide, naturalPosition) {
    switch (otherGuide.type) {
      case 'LINE':
        return intersectLineAndCircle(otherGuide, this, naturalPosition);

      case 'CIRCLE':
        return intersectCircleAndCircle(this, otherGuide, naturalPosition);

      default:
        throw Error('unknown Guide type: ' + otherGuide.type);
    }
  }

  intervalGuide(nodes, naturalPosition) {
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
