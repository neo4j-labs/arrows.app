import {getStyleSelector} from "../selectors/style";
import {NodeLabelsOutsideNode} from "./NodeLabelsOutsideNode";
import {NodeCaptionInsideNode} from "./NodeCaptionInsideNode";
import {NodeBackground} from "./NodeBackground";
import {NodePropertiesStalk} from "./NodePropertiesStalk";
import {neighbourPositions} from "../model/Graph";
import BoundingBox from "./utils/BoundingBox";
import {NodeCaptionOutsideNode} from "./NodeCaptionOutsideNode";
import {NodePropertiesInside} from "./NodePropertiesInside";
import {bisect} from "./bisect";
import {NodeLabelsInsideNode} from "./NodeLabelsInsideNode";

export default class VisualNode {
  constructor(node, graph, selected, editing, measureTextContext) {
    this.node = node
    this.selected = selected
    this.editing = editing

    const style = styleAttribute => getStyleSelector(node, styleAttribute)(graph)

    this.internalRadius = style('radius')
    this.radius = this.internalRadius + style('border-width')
    this.background = new NodeBackground(node.position, this.internalRadius, style)
    const neighbourObstacles = neighbourPositions(node, graph).map(position => {
      return { angle: position.vectorFrom(node.position).angle() }
    })
    let obstacles = neighbourObstacles

    const insideComponents = []
    let scaleFactor = 1

    const labelPosition = style('label-position')
    const propertyPosition = style('property-position')
    const captionPosition = style('caption-position')

    switch (labelPosition) {
      case 'inside':
        insideComponents.push(() => {
          const verticalAlignment = propertyPosition === 'inside' && Object.keys(node.properties).length > 0 ? 'top' : 'middle'
          return this.labels = new NodeLabelsInsideNode(
            node.labels, node.position, this.radius, scaleFactor, verticalAlignment, [], editing, style, measureTextContext
          )
        })
        break

      default:
        this.labels = new NodeLabelsOutsideNode(
          node.labels, this.radius, node.position, neighbourObstacles, editing, style, measureTextContext
        )
    }

    switch (propertyPosition) {
      case 'inside':
        insideComponents.push(() => {
          // const otherComponents = labelPosition === 'inside' && this.labels.isEmpty ? [] : [this.labels]
          return this.properties = new NodePropertiesInside(
            node.properties, this.radius, scaleFactor, node.position, 'middle', editing, style, measureTextContext
          )
        })
        break

      default:
        this.properties = new NodePropertiesStalk(
          node.properties, this.radius, node.position, obstacles, editing, style, measureTextContext
        )
        if (!this.properties.isEmpty) {
          obstacles = [...neighbourObstacles, this.properties]
        }
    }

    const caption = node.caption || ''
    switch (captionPosition) {
      case 'inside':
        insideComponents.push(() => {
          return this.caption = new NodeCaptionInsideNode(caption, node.position, this.radius, scaleFactor, style, measureTextContext)
        })
        break
      default:
        this.caption = new NodeCaptionOutsideNode(caption, node.position, this.radius, captionPosition, style, measureTextContext)
        break
    }

    this.scaleFactor = bisect((factor) => {
      scaleFactor = factor
      return insideComponents.map(factory => factory()).every(component => component.contentsFit)
    }, 1, 1e-6)
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

  get contentsFit() {
    return this.scaleFactor === 1
  }

  draw(ctx) {
    if (this.status === 'combined') {
      return
    }

    if (this.selected) {
      this.background.drawSelectionIndicator(ctx)
      this.caption.drawSelectionIndicator(ctx)
      this.labels.drawSelectionIndicator(ctx)
      this.properties.drawSelectionIndicator(ctx)
    }
    this.background.draw(ctx)
    if (!this.editing) {
      this.caption.draw(ctx)
    }
    this.labels.draw(ctx)
    this.properties.draw(ctx)
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

    if (!this.labels.isEmpty) {
      box = box.combine(this.labels.boundingBox())
    }

    if (!this.properties.isEmpty) {
      box = box.combine(this.properties.boundingBox())
    }

    return box
  }

  distanceFrom(point) {
    return Math.min(
      this.position.vectorFrom(point).distance(),
      this.caption.distanceFrom(point),
      this.labels.distanceFrom(point),
      this.properties.distanceFrom(point)
    )
  }
}