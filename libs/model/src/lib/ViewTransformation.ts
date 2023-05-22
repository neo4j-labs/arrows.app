// ABK: moved from `state`

import { Point } from "./Point";
import {Vector} from "./Vector";

export class ViewTransformation {
  scale: number;
  offset: Vector;
  constructor(scale = 1, offset = new Vector(0, 0)) {
    this.scale = scale
    this.offset = offset
  }

  zoom(scale:number) {
    return new ViewTransformation(scale, this.offset)
  }

  scroll(vector:Vector) {
    return new ViewTransformation(this.scale, this.offset.plus(vector))
  }

  transform(point:Point) {
    return point.scale(this.scale).translate(this.offset)
  }

  inverse(point:Point) {
    return point.translate(this.offset.invert()).scale(1 / this.scale)
  }

  adjust(scale:number, panX:number, panY:number) {
    return new ViewTransformation(scale, new Vector(panX, panY))
  }

  asCSSTransform() {
    return `${this.offset.asCSSTransform()} scale(${this.scale})`
  }
}