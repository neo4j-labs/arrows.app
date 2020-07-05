import {Vector} from "../model/Vector";
import {PropertiesBox} from "./PropertiesBox";

export class NodePropertiesInside {
  constructor(properties, verticalPosition, editing, style, textMeasurement) {
    this.propertiesBox = new PropertiesBox(properties, editing, style, textMeasurement)
    this.width = this.propertiesBox.boxWidth
    this.height = this.propertiesBox.boxHeight
    this.boxPosition = new Vector(-this.width / 2, verticalPosition)
  }

  get isEmpty() {
    return this.propertiesBox.isEmpty
  }

  draw(ctx) {
    if (!this.isEmpty) {
      ctx.save()

      ctx.translate(...this.boxPosition.dxdy)
      this.propertiesBox.draw(ctx)

      ctx.restore()
    }
  }

  boundingBox() {
    return this.propertiesBox.boundingBox().translate(this.boxPosition)
  }

  distanceFrom(point) {
    return this.boundingBox().contains(point) ? 0 : Infinity
  }
}
