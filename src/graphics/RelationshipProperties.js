import {Vector} from "../model/Vector";
import {textAlignmentAtAngle} from "./circumferentialTextAlignment";
import {PropertiesBox} from "./PropertiesBox";

export class RelationshipProperties {
  constructor(properties, arrow, editing, style, textMeasurement) {
    this.angle = arrow.shaftAngle()
    this.alignment = textAlignmentAtAngle(this.angle)
    this.propertiesBox = new PropertiesBox(properties, editing, style, textMeasurement)
    this.boxPosition = arrow.midPoint()
      .translate(new Vector(
        this.alignment.horizontal === 'right' ? -this.propertiesBox.boxWidth : 0,
        this.alignment.vertical === 'top' ? -this.propertiesBox.boxHeight : 0)
      )
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
