import { drawTextLine } from './canvasRenderer';
import { fitTextToCircle } from './utils/circleWordWrap';
import { Point, StyleFunction } from '@neo4j-arrows/model';
import { BoundingBox } from './utils/BoundingBox';
import { TextMeasurementContext } from './utils/TextMeasurementContext';
import { FontStyle } from './FontStyle';
import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { DrawingContext } from './utils/DrawingContext';

export class NodeCaptionFillNode {
  caption: string;
  radius: number;
  editing: boolean;
  font: FontStyle;
  fontColor: string;
  orientation: { horizontal: string; vertical: string };
  lineHeight: number;
  layout: { top: number; lines: (string | undefined)[]; allTextFits: boolean };
  constructor(
    caption: string,
    radius: number,
    editing: boolean,
    style: StyleFunction,
    textMeasurement: TextMeasurementContext
  ) {
    this.caption = caption;
    this.radius = radius;
    this.editing = editing;
    this.font = {
      fontWeight: style('caption-font-weight') as string,
      fontSize: style('caption-font-size') as number,
      fontFamily: style('font-family') as string,
    };
    textMeasurement.font = this.font;
    this.fontColor = style('caption-color') as string;
    this.orientation = { horizontal: 'center', vertical: 'center' };
    this.lineHeight = this.font.fontSize * 1.2;
    const measureWidth = (s: string) => textMeasurement.measureText(s).width;
    this.layout = fitTextToCircle(
      this.caption,
      Math.max(1, this.radius),
      measureWidth,
      this.lineHeight
    );
  }

  get type() {
    return 'CAPTION';
  }

  draw(ctx: DrawingContext) {
    if (this.editing) return;

    ctx.save();

    ctx.font = this.font;
    ctx.fillStyle = this.fontColor;
    ctx.textBaseline = 'middle';

    for (let i = 0; i < this.layout.lines.length; i++) {
      const yPos = this.layout.top + (i + 0.5) * this.lineHeight;
      drawTextLine(
        ctx,
        this.layout.lines[i] as string,
        new Point(0, yPos),
        'center'
      );
    }

    ctx.restore();
  }

  get contentsFit() {
    return this.layout.allTextFits;
  }

  boundingBox() {
    const height = this.layout.lines.length * this.lineHeight;
    return new BoundingBox(
      -this.radius,
      this.radius,
      this.layout.top,
      this.layout.top + height
    );
  }

  distanceFrom(point: Point) {
    return point.vectorFromOrigin().distance();
  }
}
