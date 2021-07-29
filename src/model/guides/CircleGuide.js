import {intersectCircleAndCircle, intersectLineAndCircle} from "./intersections";

export class CircleGuide {
  constructor(center, radius, naturalPosition) {
    this.center = center
    this.radius = radius
    this.error = this.calculateError(naturalPosition)
  }

  get type() {
    return 'CIRCLE'
  }

  calculateError(naturalPosition) {
    const offset = naturalPosition.vectorFrom(this.center)
    return Math.abs(offset.distance() - this.radius)
  }

  snap(naturalPosition) {
    let offset = naturalPosition.vectorFrom(this.center)
    return this.center.translate(offset.scale(this.radius / offset.distance()))
  }

  scalar(position) {
    let offset = position.vectorFrom(this.center)
    return offset.angle()
  }

  combine(otherGuide, naturalPosition) {
    switch (otherGuide.type) {
      case 'LINE':
        return intersectLineAndCircle(otherGuide, this, naturalPosition)

      case 'CIRCLE':
        return intersectCircleAndCircle(this, otherGuide, naturalPosition)

      default:
        throw Error('unknown Guide type: ' + otherGuide.type)
    }
  }
}