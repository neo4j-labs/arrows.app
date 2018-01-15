export default class NeoNode {
  constructor (node, viewTransformation) {
    this.node = node
    this.viewTransformation= viewTransformation
  }

  get id () {
    return this.node.id.value
  }

  get x () {
    if (this.viewTransformation) {
      return this.viewTransformation.transform(this.node.position).x
    } else {
      return this.node.position.x
    }
  }

  get y () {
    if (this.viewTransformation) {
      return this.viewTransformation.transform(this.node.position).y
    } else {
      return this.node.position.y
    }
  }

  get radius () {
    return this.node.radius
  }

  distanceToBorder () {
    return this.radius
  }
}