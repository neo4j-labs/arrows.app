import {Point} from "./Point"
import uuid from "uuid/v4"

export class Node {
  constructor(id = {
    type: 'SYNTHETIC',
    value: uuid()
  }, position = new Point(1000 * Math.random(), 1000 * Math.random()), caption = "") {
    this.id = id
    this.position = position
    this.radius = 50
    this.caption = caption
  }

  idMatches(id) {
    return Node.idsMatch(this.id, id) || Node.idsMatch(this.originalId, id)
  }

  static idsMatch(a, b) {
    return a && b && a.type === b.type && a.value === b.value
  }

  withNewId(id) {
    let node = new Node(id, this.position, this.caption);
    if (this.id.type === 'SYNTHETIC') {
      node.originalId = this.id
    }
    return node
  }

  moveTo(newPosition) {
    return new Node(this.id, newPosition, this.caption)
  }
}
