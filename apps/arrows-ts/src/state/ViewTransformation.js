import {Vector} from "../model-old/Vector";

export class ViewTransformation {
  constructor(scale = 1, offset = new Vector(0, 0)) {
    this.scale = scale
    this.offset = offset
  }

  zoom(scale) {
    return new ViewTransformation(scale, this.offset)
  }

  scroll(vector) {
    return new ViewTransformation(this.scale, this.offset.plus(vector))
  }

  transform(point) {
    return point.scale(this.scale).translate(this.offset)
  }

  inverse(point) {
    return point.translate(this.offset.invert()).scale(1 / this.scale)
  }

  adjust(scale, panX, panY) {
    return new ViewTransformation(scale, new Vector(panX, panY))
  }

  asCSSTransform() {
    return `${this.offset.asCSSTransform()} scale(${this.scale})`
  }
}