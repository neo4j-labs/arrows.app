import { Point, StyleFunction } from '@neo4j-arrows/model';
import { PropertiesBox } from './PropertiesBox';
import { TextMeasurementContext } from './utils/TextMeasurementContext';
import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { DrawingContext } from './utils/DrawingContext';

export class NodePropertiesInside {
  propertiesBox: PropertiesBox;
  width: number;
  height: number;
  boxPosition: Point;
  constructor(
    properties: Record<string, string>,
    editing: boolean,
    style: StyleFunction,
    textMeasurement: TextMeasurementContext
  ) {
    this.propertiesBox = new PropertiesBox(
      properties,
      editing,
      style,
      textMeasurement
    );
    this.width = this.propertiesBox.boxWidth;
    this.height = this.propertiesBox.boxHeight;
    this.boxPosition = new Point(-this.width / 2, 0);
  }

  get type() {
    return 'PROPERTIES';
  }

  get isEmpty() {
    return this.propertiesBox.isEmpty;
  }

  draw(ctx: DrawingContext) {
    if (!this.isEmpty) {
      ctx.save();

      ctx.translate(...this.boxPosition.xy);
      this.propertiesBox.draw(ctx);

      ctx.restore();
    }
  }

  boundingBox() {
    return this.propertiesBox
      .boundingBox()
      .translate(this.boxPosition.vectorFromOrigin());
  }

  distanceFrom(point: Point) {
    return this.boundingBox().contains(point) ? 0 : Infinity;
  }
}
