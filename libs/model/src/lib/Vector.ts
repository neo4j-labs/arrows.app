export class Vector {
  constructor(readonly dx: number, readonly dy: number) {}

  plus(otherVector: Vector) {
    return new Vector(this.dx + otherVector.dx, this.dy + otherVector.dy);
  }

  minus(otherVector: Vector) {
    return new Vector(this.dx - otherVector.dx, this.dy - otherVector.dy);
  }

  scale(scaleFactor: number) {
    return new Vector(this.dx * scaleFactor, this.dy * scaleFactor);
  }

  dot(vector: Vector) {
    return this.dx * vector.dx + this.dy * vector.dy;
  }

  invert() {
    return new Vector(-this.dx, -this.dy);
  }

  rotate(angle: number) {
    return new Vector(
      this.dx * Math.cos(angle) - this.dy * Math.sin(angle),
      this.dx * Math.sin(angle) + this.dy * Math.cos(angle)
    );
  }

  perpendicular() {
    return new Vector(-this.dy, this.dx);
  }

  distance() {
    return Math.sqrt(this.dx * this.dx + this.dy * this.dy);
  }

  unit() {
    return this.scale(1 / this.distance());
  }

  angle() {
    return Math.atan2(this.dy, this.dx);
  }

  get dxdy(): [number, number] {
    return [this.dx, this.dy];
  }

  asCSSTransform() {
    return `translate(${this.dx}px,${this.dy}px)`;
  }
}
