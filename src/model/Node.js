import {Point} from "./Point"

export class Node {
  constructor(position = new Point(1000 * Math.random(), 1000 * Math.random())) {
    this.position = position
    this.radius = 50
  }
}
