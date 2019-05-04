import {drawSolidCircle} from "./canvasRenderer";
import { getStyleSelector } from "../selectors/style";
import { nodeStyleAttributes } from "../model/styling";
import {NodeLabels} from "./NodeLabels";
import {NodeCaption} from "./NodeCaption";
import {NodeBorder} from "./NodeBorder";

export default class VisualNode {
  constructor(node, graph) {
    this.node = node

    nodeStyleAttributes.forEach(styleAttribute => {
      this[styleAttribute] = getStyleSelector(node, styleAttribute)(graph)
    })

    this.style = styleAttribute => getStyleSelector(node, styleAttribute)(graph)
    if (this.style('border-width') > 0) {
      this.border = new NodeBorder(this.style)
    }
    if (node.caption) {
      this.caption = new NodeCaption(node.caption, this.style)
    }
    if (node.labels && node.labels.length > 0) {
      this.labels = new NodeLabels(node.labels, this.style)
    }
  }

  get id() {
    return this.node.id
  }

  get x () {
    return this.node.position.x
  }

  get y () {
    return this.node.position.y
  }

  get position() {
    return this.node.position
  }

  get status() {
    return this.node.status
  }

  get superNodeId() {
    return this.node.superNodeId
  }

  get type() {
    return this.node.type
  }

  get initialPositions () {
    return this.node.initialPositions
  }

  draw(ctx) {
    if (this.status === 'combined') {
      return
    }

    drawSolidCircle(ctx, this.position, this['node-color'], this.radius)

    if (this.border) {
      this.border.draw(this.position, this.radius, ctx)
    }
    if (this.caption) {
      this.caption.draw(this.position, this.radius * 2, ctx)
    }
    if (this.labels) {
      this.labels.draw(this.position, this.radius, ctx)
    }
  }
}