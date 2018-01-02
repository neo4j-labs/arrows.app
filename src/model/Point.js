import {Vector} from "./Vector";

export class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  vectorFrom(otherPoint) {
    return new Vector(this.x - otherPoint.x, this.y - otherPoint.y)
  }

  scale(scaleFactor) {
    return new Point(this.x * scaleFactor, this.y * scaleFactor)
  }

  translate(vector) {
    return new Point(this.x + vector.dx, this.y + vector.dy)
  }
}
