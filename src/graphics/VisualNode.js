import { getStyleSelector } from "../selectors/style";
import {NodeLabels} from "./NodeLabels";
import {NodeCaptionInsideNode} from "./NodeCaptionInsideNode";
import {NodeBackground} from "./NodeBackground";
import {NodeProperties} from "./NodeProperties";
import {neighbourPositions} from "../model/Graph";
import BoundingBox from "./utils/BoundingBox";
import {NodeCaptionOutsideNode} from "./NodeCaptionOutsideNode";

export default class VisualNode {
  constructor(node, graph, editing, measureTextContext) {
    this.node = node
    this.editing = editing

    const style = styleAttribute => getStyleSelector(node, styleAttribute)(graph)

    this.internalRadius = style('radius')
    this.radius = this.internalRadius + style('border-width')
    this.background = new NodeBackground(node.position, this.internalRadius, style)
    const caption = node.caption || ''
    const captionPosition = style('caption-position')
    switch (captionPosition) {
      case 'inside':
        this.caption = new NodeCaptionInsideNode(caption, node.position, this.radius, style, measureTextContext)
        break
      default:
        this.caption = new NodeCaptionOutsideNode(caption, node.position, this.radius, captionPosition, style, measureTextContext)
        break
    }
    const neighbourObstacles = neighbourPositions(node, graph).map(position => {
      return { angle: position.vectorFrom(node.position).angle() }
    })
    if (node.labels && node.labels.length > 0) {
      this.labels = new NodeLabels(node.labels, this.radius, node.position, neighbourObstacles, style, measureTextContext)
    }
    const obstacles = this.labels ? [...neighbourObstacles, this.labels] : neighbourObstacles

    if (Object.keys(node.properties).length > 0) {
      this.properties = new NodeProperties(
        node.properties, this.radius, node.position, obstacles, style, measureTextContext
      )
    }
  }

  get id() {
    return this.node.id
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

  get initialPositions() {
    return this.node.initialPositions
  }

  get captionFits() {
    if (this.caption) {
      return this.caption.captionFits()
    }
    return true
  }

  draw(ctx) {
    if (this.status === 'combined') {
      return
    }

    this.background.draw(ctx)
    if (!this.editing && this.caption) {
      this.caption.draw(ctx)
    }
    if (this.labels) {
      this.labels.draw(ctx)
    }
    if (this.properties) {
      this.properties.draw(ctx)
    }
  }

  boundingBox() {
    let box = new BoundingBox(
      this.position.x - this.radius,
      this.position.x + this.radius,
      this.position.y - this.radius,
      this.position.y + this.radius
    )

    if (this.caption) {
      box = box.combine(this.caption.boundingBox())
    }

    if (this.labels) {
      box = box.combine(this.labels.boundingBox())
    }

    if (this.properties) {
      box = box.combine(this.properties.boundingBox())
    }

    return box
  }
}