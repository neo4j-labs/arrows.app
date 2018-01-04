import {Vector} from "../model/Vector";

export class ViewTransformation {
  constructor(scale = 1, offset = new Vector(0, 0)) {
    this.scale = scale
    this.offset = offset
  }

  zoom(scale) {
    return new ViewTransformation(scale, this.offset)
  }

  pan(offset) {
    return new ViewTransformation(this.scale, this.offset.plus(offset))
  }

  transform(point) {
    return point.scale(this.scale).translate(this.offset)
  }

  inverse(point) {
    return point.translate(this.offset.invert()).scale(1 / this.scale)
  }
}