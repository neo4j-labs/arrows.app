import {intersectCircleAndCircle, intersectLineAndCircle} from "./intersections";

export class CircleGuide {
  constructor(center, radius) {
    this.center = center
    this.radius = radius
  }

  get type() {
    return 'CIRCLE'
  }

  snap(naturalPosition) {
    let offset = naturalPosition.vectorFrom(this.center)
    return this.center.translate(offset.scale(this.radius / offset.distance()))
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