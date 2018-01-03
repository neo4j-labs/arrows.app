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
    return new ViewTransformation(this.scale, offset)
  }

  transform(point) {
    return point.scale(this.scale).translate(this.offset)
  }
}