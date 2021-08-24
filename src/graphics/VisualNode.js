import {getStyleSelector} from "../selectors/style";
import {NodeLabelsOutsideNode} from "./NodeLabelsOutsideNode";
import {NodeCaptionInsideNode} from "./NodeCaptionInsideNode";
import {NodeBackground} from "./NodeBackground";
import {PropertiesOutside} from "./PropertiesOutside";
import {neighbourPositions} from "../model/Graph";
import BoundingBox from "./utils/BoundingBox";
import {NodeCaptionOutsideNode} from "./NodeCaptionOutsideNode";
import {NodePropertiesInside} from "./NodePropertiesInside";
import {bisect} from "./bisect";
import {NodeLabelsInsideNode} from "./NodeLabelsInsideNode";
import {NodeCaptionFillNode} from "./NodeCaptionFillNode";
import {NodeIconInside} from "./NodeIconInside";
import {IconOutside} from "./IconOutside";
import {distribute} from "./circumferentialDistribution";
import {orientationAngles, orientationFromAngle, orientationFromName} from "./circumferentialTextAlignment";
import {Vector} from "../model/Vector";
import {ComponentStack} from "./ComponentStack";

export default class VisualNode {
  constructor(node, graph, selected, editing, measureTextContext, imageCache) {
    this.node = node
    this.selected = selected
    this.editing = editing

    const style = styleAttribute => getStyleSelector(node, styleAttribute)(graph)

    this.internalRadius = style('radius')
    this.radius = this.internalRadius + style('border-width')
    this.outsideComponentRadius = this.radius + style('node-margin')
    this.fitRadius = this.internalRadius - style('node-padding')
    this.background = new NodeBackground(node.position, this.internalRadius, editing, style)
    const neighbourObstacles = neighbourPositions(node, graph).map(position => {
      return { angle: position.vectorFrom(node.position).angle() }
    })

    this.internalVerticalOffset = 0
    this.internalScaleFactor = undefined
    this.insideComponents = new ComponentStack()
    this.outsideComponents = new ComponentStack()

    const captionPosition = style('caption-position')
    const labelPosition = style('label-position')
    const propertyPosition = style('property-position')
    const iconImage = style('icon-image')
    const iconPosition = style('icon-position')
    const hasIcon = !!iconImage
    const hasCaption = !!node.caption
    const hasLabels = node.labels.length > 0
    const hasProperties = Object.keys(node.properties).length > 0

    const outsidePosition = style('outside-position')
    switch (outsidePosition) {
      case 'auto':
        this.outsideOrientation = orientationFromAngle(distribute(orientationAngles, neighbourObstacles))
        break

      default:
        this.outsideOrientation = orientationFromName(outsidePosition)
    }

    const caption = node.caption || ''
    if (hasCaption) {
      switch (captionPosition) {
        case 'inside':
          if ((hasLabels && labelPosition === 'inside') ||
            (hasProperties && propertyPosition === 'inside')) {
            this.insideComponents.push(this.caption =
              new NodeCaptionInsideNode(caption, editing, style, measureTextContext))
          } else {
            this.internalScaleFactor = bisect((factor) => {
              this.caption = new NodeCaptionFillNode(caption, this.fitRadius / factor, editing, style, measureTextContext)
              return this.caption.contentsFit
            }, 1, 1e-6)
            this.insideComponents.push(this.caption)
          }
          break
        default:
          this.outsideComponents.push(this.caption = new NodeCaptionOutsideNode(
            caption, this.outsideOrientation, editing, style, measureTextContext))
          break
      }
    }

    if (hasLabels) {
      switch (labelPosition) {
        case 'inside':
          this.insideComponents.push(this.labels = new NodeLabelsInsideNode(
            node.labels, editing, style, measureTextContext))
          break

        default:
          this.outsideComponents.push(this.labels = new NodeLabelsOutsideNode(
            node.labels, this.outsideOrientation, editing, style, measureTextContext))
      }
    }

    if (hasProperties) {
      switch (propertyPosition) {
        case 'inside':
          this.insideComponents.push(this.properties = new NodePropertiesInside(
            node.properties, editing, style, measureTextContext))
          break

        default:
          this.outsideComponents.push(this.properties = new PropertiesOutside(
            node.properties, this.outsideOrientation, editing, style, measureTextContext))
      }
    }

    if (hasIcon) {
      switch (iconPosition) {
        case 'inside':
          this.insideComponents.push(this.icon = new NodeIconInside(editing, style, imageCache))
          break;
        default:
          this.outsideComponents.push(this.icon = new IconOutside(this.outsideOrientation, editing, style, imageCache))
      }
    }

    if (this.internalScaleFactor === undefined) {
      this.internalVerticalOffset = -this.insideComponents.totalHeight() / 2
      this.internalScaleFactor = this.insideComponents.everythingFits(this.internalVerticalOffset, this.fitRadius) ?
        1 : this.insideComponents.scaleToFit(this.internalVerticalOffset, this.fitRadius)
    }

    const outsideVerticalOffset = (() => {
      const height = this.outsideComponents.totalHeight()
      switch (this.outsideOrientation.vertical) {
        case 'top':
          return -height
        case 'center':
          return -height / 2
        case 'bottom':
          return 0
      }
    })()
    this.outsideOffset = new Vector(1, 0)
      .rotate(this.outsideOrientation.angle)
      .scale(this.outsideComponentRadius)
      .plus(new Vector(0, outsideVerticalOffset))
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

    if (this.selected) {
      this.background.drawSelectionIndicator(ctx)

      ctx.save()
      ctx.translate(...this.position.xy)
      ctx.translate(...this.outsideOffset.dxdy)

      this.outsideComponents.drawSelectionIndicator(ctx)

      ctx.restore()
    }

    this.background.draw(ctx)

    ctx.save()
    ctx.translate(...this.position.xy)

    ctx.save()
    ctx.scale(this.internalScaleFactor);
    ctx.translate(0, this.internalVerticalOffset);

    this.insideComponents.draw(ctx)

    ctx.restore()

    ctx.save()
    ctx.translate(...this.outsideOffset.dxdy)

    this.outsideComponents.draw(ctx)

    ctx.restore()

    ctx.restore()
  }

  boundingBox() {
    let box = new BoundingBox(
      this.position.x - this.radius,
      this.position.x + this.radius,
      this.position.y - this.radius,
      this.position.y + this.radius
    )

    if (this.outsideComponents.isEmpty()) {
      return box
    }

    return box.combine(this.outsideComponents.boundingBox()
      .translate(this.position.vectorFromOrigin())
      .translate(this.outsideOffset))
  }

  distanceFrom(point) {
    const localPoint = point.translate(this.position.vectorFromOrigin().invert())
    const outsidePoint = localPoint.translate(this.outsideOffset.invert())
    return Math.min(
      this.position.vectorFrom(point).distance(),
      this.outsideComponents.distanceFrom(outsidePoint)
    )
  }
}