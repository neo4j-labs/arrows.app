import {intersectLineAndCircle, intersectLineAndLine} from "./intersections";
import {Vector} from "../../model/Vector";

export class LineGuide {
  constructor(center, angle) {
    this.center = center
    this.angle = angle
  }

  get type() {
    return 'LINE'
  }

  snap(naturalPosition) {
    let offset = naturalPosition.vectorFrom(this.center)
    const vector = new Vector(1, 0).scale(offset.distance()).rotate(this.angle)
    return this.center.translate(vector)
  }

  combine(otherGuide, naturalPosition) {
    switch (otherGuide.type) {
      case 'LINE':
        return intersectLineAndLine(this, otherGuide, naturalPosition)

      case 'CIRCLE':
        return intersectLineAndCircle(this, otherGuide, naturalPosition)

      default:
        throw Error('unknown Guide type: ' + otherGuide.type)
    }
  }
}