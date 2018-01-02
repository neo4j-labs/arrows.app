import {Vector} from "../model/Vector";

export class PanZoomState {
  constructor() {
    this.zoom = 1
    this.pan = new Vector(0, 0)
  }

  transform(point) {
    return point.scale(this.zoom).translate(this.pan)
  }
}