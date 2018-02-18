import {Point} from "./Point"
import uuid from "uuid/v4"
import {idsMatch, syntheticId} from "./Id";

export default class Node {
  constructor(
    id = syntheticId(uuid()),
    position = new Point(1000 * Math.random(), 1000 * Math.random()),
    caption = "",
    color = '#53acf3',
    state = 'new'
    ) {
    this.id = id
    this.position = position
    this.radius = 50
    this.caption = caption
    this.color = color
    this.state = state
  }

  idMatches(id) {
    return idsMatch(this.id, id) || idsMatch(this.originalId, id)
  }

  withNewId(id) {
    let node = new Node(id, this.position, this.caption);
    if (this.id.type === 'SYNTHETIC') {
      node.originalId = this.id
    }
    return node
  }

  moveTo(newPosition) {
    return new Node(this.id, newPosition, this.caption, this.color, 'modified')
  }
}
