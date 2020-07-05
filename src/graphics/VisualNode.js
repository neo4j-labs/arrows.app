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
import {NodeCaptionFillNode} from "./NodeCaptionFillNode";
import {everythingFits, scaleToFit, totalHeight} from "./fitComponentsInsideNode";

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

    const captionPosition = style('caption-position')
    const labelPosition = style('label-position')
    const propertyPosition = style('property-position')

    const caption = node.caption || ''
    switch (captionPosition) {
      case 'inside':
        if (labelPosition === 'inside' || propertyPosition === 'inside') {
          insideComponents.push(this.caption =
            new NodeCaptionInsideNode(caption, style, measureTextContext))
        } else {
          // use bisect here to determine scale factor
          // this.scaleFactor = bisect((factor) => {
          //   scaleFactor = factor
          //   return insideComponents.map(factory => factory()).every(component => component.contentsFit)
          // }, 1, 1e-6)
          insideComponents.push(this.caption =
            new NodeCaptionFillNode(caption, this.radius, style, measureTextContext))
        }
        break
      default:
        this.caption = new NodeCaptionOutsideNode(caption, node.position, this.radius, captionPosition, style, measureTextContext)
        break
    }

    switch (labelPosition) {
      case 'inside':
        insideComponents.push(this.labels =
          new NodeLabelsInsideNode(node.labels, totalHeight(insideComponents), editing, style, measureTextContext))
        break

      default:
        this.labels = new NodeLabelsOutsideNode(
          node.labels, this.radius, node.position, neighbourObstacles, editing, style, measureTextContext
        )
    }

    switch (propertyPosition) {
      case 'inside':
        insideComponents.push(this.properties =
          new NodePropertiesInside(node.properties, totalHeight(insideComponents), editing, style, measureTextContext))
        break

      default:
        this.properties = new NodePropertiesStalk(
          node.properties, this.radius, node.position, obstacles, editing, style, measureTextContext
        )
        if (!this.properties.isEmpty) {
          obstacles = [...neighbourObstacles, this.properties]
        }
    }

    this.internalVerticalOffset = -totalHeight(insideComponents) / 2
    this.internalScaleFactor = everythingFits(insideComponents, this.internalVerticalOffset, this.internalRadius) ?
      1 : scaleToFit(insideComponents, this.internalVerticalOffset, this.internalRadius)
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

  draw(ctx) {
    if (this.status === 'combined') {
      return
    }

    this.background.draw(ctx)

    ctx.save();
    ctx.translate(...this.position.xy);
    ctx.scale(this.internalScaleFactor);
    ctx.translate(0, this.internalVerticalOffset);

    ([this.caption, this.labels, this.properties]).forEach(component => {
      if (component.isInside) {
        component.draw(ctx)
      }
    })
    ctx.restore()

    if (this.selected) {
      this.background.drawSelectionIndicator(ctx)
      this.caption.drawSelectionIndicator(ctx)
      this.labels.drawSelectionIndicator(ctx)
      this.properties.drawSelectionIndicator(ctx)
    }
    ([this.caption, this.labels, this.properties]).forEach(component => {
      if (!component.isInside) {
        if (!this.editing) {
          this.caption.draw(ctx)
        }
        this.labels.draw(ctx)
        this.properties.draw(ctx)
      }
    })
  }

  boundingBox() {
    let box = new BoundingBox(
      this.position.x - this.radius,
      this.position.x + this.radius,
      this.position.y - this.radius,
      this.position.y + this.radius
    )

    // if (this.caption) {
    //   box = box.combine(this.caption.boundingBox())
    // }
    //
    // if (!this.labels.isEmpty) {
    //   box = box.combine(this.labels.boundingBox())
    // }
    //
    // if (!this.properties.isEmpty) {
    //   box = box.combine(this.properties.boundingBox())
    // }

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