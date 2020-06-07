import {Vector} from "../model/Vector";
import {PropertiesBox} from "./PropertiesBox";

export class NodePropertiesInside {
  constructor(properties, radius, scaleFactor, nodePosition, verticalAlignment, editing, style, textMeasurement) {
    this.nodePosition = nodePosition
    this.scaleFactor = scaleFactor
    this.propertiesBox = new PropertiesBox(properties, editing, style, textMeasurement)
    const width = this.propertiesBox.boxWidth * scaleFactor
    const height = this.propertiesBox.boxHeight * scaleFactor
    const sq = n => n * n

    this.contentsFit = Math.sqrt(sq(width / 2) + sq(height / 2)) < radius
    if (this.contentsFit && verticalAlignment === 'bottom') {
      const d = Math.sqrt(sq(radius) - sq(width / 2))
      this.boxPosition = new Vector(-width / 2, d - height)
    } else {

      this.boxPosition = new Vector(-width / 2, -height / 2)
    }
  }

  get isEmpty() {
    return this.propertiesBox.isEmpty
  }

  draw(ctx) {
    if (!this.isEmpty) {
      ctx.save()

      ctx.translate(...this.nodePosition.xy)
      ctx.translate(...this.boxPosition.dxdy)
      ctx.scale(this.scaleFactor)
      this.propertiesBox.draw(ctx)

      ctx.restore()
    }
  }

  drawSelectionIndicator(ctx) {
  }

  boundingBox() {
    return this.propertiesBox.boundingBox().translate(this.nodePosition.vectorFromOrigin()).translate(this.boxPosition)
  }

  distanceFrom(point) {
    return this.boundingBox().contains(point) ? 0 : Infinity
  }
}
