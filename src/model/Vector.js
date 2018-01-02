export class Vector {
  constructor(dx, dy) {
    this.dx = dx
    this.dy = dy
  }

  minus(otherVector) {
    return new Vector(this.dx - otherVector.dx, this.dy - otherVector.dy)
  }

  distance() {
    return Math.sqrt(this.dx * this.dx + this.dy * this.dy)
  }
}