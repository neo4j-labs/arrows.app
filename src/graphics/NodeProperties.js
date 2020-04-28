import {Vector} from "../model/Vector";
import {distribute} from "./circumferentialDistribution";
import {textAlignmentAtAngle} from "./circumferentialTextAlignment";
import {PropertiesBox} from "./PropertiesBox";
import {green} from "../model/colors";

export class NodeProperties {
  constructor(properties, radius, nodePosition, obstacles, editing, style, textMeasurement) {
    this.angle = distribute([
      {preferredAngles: [Math.PI / 2, -Math.PI / 2, 0, Math.PI, Math.PI / 4, 3 * Math.PI / 4, -Math.PI * 3 / 4, -Math.PI / 4], payload: 'properties'}
    ], obstacles)[0].angle
    this.alignment = textAlignmentAtAngle(this.angle)
    this.radius = radius
    this.nodePosition = nodePosition
    this.propertiesBox = new PropertiesBox(properties, editing, style, textMeasurement)
    this.attachedAt = this.nodePosition.translate(new Vector(1, 0).rotate(this.angle).scale(this.radius))
    this.start = this.attachedAt.translate(new Vector(20, 0).rotate(this.angle))
    this.end = this.start.translate(new Vector(0, this.alignment.vertical === 'top' ? this.propertiesBox.boxHeight : -this.propertiesBox.boxHeight))
    this.boxPosition = (this.alignment.vertical === 'top' ? this.start : this.end)
      .translate(new Vector(this.alignment.horizontal === 'right' ? -this.propertiesBox.boxWidth : 0, 0))
  }

  draw(ctx) {
    if (this.propertiesBox.properties.length > 0) {
      ctx.save()

      ctx.strokeStyle = 'black'
      ctx.polyLine([
        this.attachedAt,
        this.start,
        this.end
      ])

      ctx.translate(...this.boxPosition.xy)
      this.propertiesBox.draw(ctx)

      ctx.restore()
    }
  }

  drawSelectionIndicator(ctx) {
    if (this.propertiesBox.properties.length > 0) {
      const indicatorWidth = 10
      ctx.save()
      ctx.strokeStyle = green
      ctx.lineWidth = indicatorWidth
      ctx.lineJoin = 'round'
      ctx.polyLine([
        this.attachedAt,
        this.start,
        this.end
      ])
      ctx.translate(...this.boxPosition.xy)
      this.propertiesBox.drawSelectionIndicator(ctx)
      ctx.restore()
    }
  }

  boundingBox() {
    return this.propertiesBox.boundingBox().translate(this.boxPosition.vectorFromOrigin())
  }
}
