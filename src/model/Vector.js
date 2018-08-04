export class Vector {
  constructor(dx, dy) {
    this.dx = dx
    this.dy = dy
  }

  plus(otherVector) {
    return new Vector(this.dx + otherVector.dx, this.dy + otherVector.dy)
  }

  minus(otherVector) {
    return new Vector(this.dx - otherVector.dx, this.dy - otherVector.dy)
  }

  scale(scaleFactor) {
    return new Vector(this.dx * scaleFactor, this.dy * scaleFactor)
  }

  invert() {
    return new Vector(-this.dx, -this.dy)
  }

  perpendicular() {
    return new Vector(-this.dy, this.dx)
  }

  distance() {
    return Math.sqrt(this.dx * this.dx + this.dy * this.dy)
  }

  unit () {
    const distance = this.distance()
    return new Vector(this.dx / distance, this.dy / distance)
  }
}