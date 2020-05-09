import {Vector} from "../model/Vector";
import {textAlignmentAtAngle} from "./circumferentialTextAlignment";
import {PropertiesBox} from "./PropertiesBox";

export class RelationshipProperties {
  constructor(properties, arrow, editing, style, textMeasurement) {
    this.angle = arrow.shaftAngle()
    this.alignment = textAlignmentAtAngle(this.angle)
    this.propertiesBox = new PropertiesBox(properties, editing, style, textMeasurement)
    this.boxPosition = arrow.midPoint()
      .translate(computeOffset(this.propertiesBox.boxWidth, this.propertiesBox.boxHeight, this.alignment, arrow))
  }

  get isEmpty() {
    return this.propertiesBox.isEmpty
  }

  draw(ctx) {
    if (this.propertiesBox.properties.length > 0) {
      ctx.save()

      ctx.translate(...this.boxPosition.xy)
      this.propertiesBox.draw(ctx)

      ctx.restore()
    }
  }

  drawSelectionIndicator(ctx) {
    if (!this.isEmpty) {
      ctx.save()
      ctx.translate(...this.boxPosition.xy)
      this.propertiesBox.drawSelectionIndicator(ctx)
      ctx.restore()
    }
  }

  boundingBox() {
    return this.propertiesBox.boundingBox().translate(this.boxPosition.vectorFromOrigin())
  }

  distanceFrom(point) {
    return this.boundingBox().contains(point) ? 0 : Infinity
  }
}

const computeOffset = (width, height, alignment, arrow) => {
  let dx, dy

  dx = alignment.horizontal === 'right' ? -width : 0
  dy = alignment.vertical === 'top' ? -height : 0

  const angle = arrow.shaftAngle()

  const d = ((alignment.horizontal === 'right'? 1 : -1) * (width * Math.cos(angle))
    + (alignment.vertical === 'top'? 1 : -1) * (height * Math.sin(angle))) / 2
  return new Vector(dx, dy).plus(new Vector(d, 0).rotate(angle))
}