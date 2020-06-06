import {Vector} from "../model/Vector";
import {textAlignmentAtAngle} from "./circumferentialTextAlignment";
import {PropertiesBox} from "./PropertiesBox";

export class RelationshipProperties {
  constructor(properties, arrow, editing, style, textMeasurement) {
    const shaftAngle = arrow.shaftAngle()
    this.propertiesBox = new PropertiesBox(properties, editing, style, textMeasurement)
    this.attachPoint = arrow.midPoint()
    const orientation = style('property-orientation')
    switch (orientation) {
      case 'horizontal':
        this.angle = 0
        const alignment = textAlignmentAtAngle(shaftAngle)
        this.boxPosition =
          computeOffset(this.propertiesBox.boxWidth, this.propertiesBox.boxHeight, alignment, shaftAngle)
        break

      default:
        this.angle = (shaftAngle > Math.PI / 2 || shaftAngle < -Math.PI / 2) ? shaftAngle + Math.PI : shaftAngle
        this.boxPosition = new Vector(-this.propertiesBox.boxWidth / 2, 0)
    }
  }

  get isEmpty() {
    return this.propertiesBox.isEmpty
  }

  draw(ctx) {
    if (this.propertiesBox.properties.length > 0) {
      ctx.save()

      ctx.translate(...this.attachPoint.xy)
      ctx.rotate(this.angle)
      ctx.translate(...this.boxPosition.dxdy)
      this.propertiesBox.draw(ctx)

      ctx.restore()
    }
  }

  drawSelectionIndicator(ctx) {
    if (!this.isEmpty) {
      ctx.save()

      ctx.translate(...this.attachPoint.xy)
      ctx.rotate(this.angle)
      ctx.translate(...this.boxPosition.dxdy)
      this.propertiesBox.drawSelectionIndicator(ctx)

      ctx.restore()
    }
  }

  distanceFrom(point) {
    const localPoint = point.translate(this.attachPoint.vectorFromOrigin().invert())
      .rotate(-this.angle)
      .translate(this.boxPosition.invert())
    return this.propertiesBox.boundingBox().contains(localPoint) ? 0 : Infinity
  }
}

const computeOffset = (width, height, alignment, angle) => {
  let dx, dy

  dx = alignment.horizontal === 'right' ? -width : 0
  dy = alignment.vertical === 'top' ? -height : 0

  const d = ((alignment.horizontal === 'right'? 1 : -1) * (width * Math.cos(angle))
    + (alignment.vertical === 'top'? 1 : -1) * (height * Math.sin(angle))) / 2
  return new Vector(dx, dy).plus(new Vector(d, 0).rotate(angle))
}