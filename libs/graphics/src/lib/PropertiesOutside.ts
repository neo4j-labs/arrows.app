import {Point, StyleFunction} from "@neo4j-arrows/model";
import {PropertiesBox} from "./PropertiesBox";
import { TextOrientation } from "./circumferentialTextAlignment";
import { TextMeasurementContext } from "./utils/TextMeasurementContext";
import { CanvasAdaptor } from "./utils/CanvasAdaptor";
import { DrawingContext } from "./utils/DrawingContext";

export class PropertiesOutside {
  propertiesBox: PropertiesBox;
  width: number;
  height: number;
  boxPosition: Point;
  constructor(properties:Record<string,string>, orientation:TextOrientation, editing:boolean, style:StyleFunction, textMeasurement:TextMeasurementContext) {
    this.propertiesBox = new PropertiesBox(properties, editing, style, textMeasurement)
    this.width = this.propertiesBox.boxWidth
    this.height = this.propertiesBox.boxHeight
    const horizontalPosition = (() => {
      switch (orientation.horizontal) {
        case 'start':
          return 0
        case 'center':
          return -this.width / 2
        case 'end':
          return -this.width
      }
    })()
    this.boxPosition = new Point(horizontalPosition, 0)
  }

  get type() {
    return 'PROPERTIES'
  }

  get isEmpty() {
    return this.propertiesBox.isEmpty
  }

  draw(ctx:DrawingContext) {
    if (!this.isEmpty) {
      ctx.save()

      ctx.translate(...this.boxPosition.xy)
      this.propertiesBox.drawBackground(ctx)
      this.propertiesBox.draw(ctx)

      ctx.restore()
    }
  }

  drawSelectionIndicator(ctx:DrawingContext) {
    ctx.save()
    ctx.translate(...this.boxPosition.xy)
    this.propertiesBox.drawSelectionIndicator(ctx)
    ctx.restore()
  }

  boundingBox() {
    return this.propertiesBox.boundingBox().translate(this.boxPosition.vectorFromOrigin())
  }

  distanceFrom(point:Point) {
    return this.boundingBox().contains(point) ? 0 : Infinity
  }
}
