import { drawTextLine } from './canvasRenderer';
import { Point, StyleFunction } from '@neo4j-arrows/model';
import { BoundingBox } from './utils/BoundingBox';
import { fitTextToRectangle } from './utils/rectangleWordWrap';
import { TextMeasurementContext } from './utils/TextMeasurementContext';
import { FontStyle } from './FontStyle';
import { TextOrientation } from './circumferentialTextAlignment';
import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { DrawingContext } from './utils/DrawingContext';

export class NodeCaptionInsideNode {
  editing: boolean;
  font: FontStyle;
  fontColor: string;
  orientation: TextOrientation;
  lineHeight: number;
  layout: {
    actualWidth: number;
    margin: number;
    lines: (string | undefined)[];
  };
  width: number;
  height: number;
  constructor(
    caption: string,
    editing: boolean,
    style: StyleFunction,
    textMeasurement: TextMeasurementContext
  ) {
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
    this.layout = fitTextToRectangle(
      caption,
      style('caption-max-width') as number,
      measureWidth
    );
    this.width = this.layout.actualWidth;
    this.height = this.layout.lines.length * this.lineHeight;
  }

  get type() {
    return 'CAPTION';
  }

  draw(ctx: DrawingContext) {
    if (this.editing) return;

    ctx.save();

    ctx.fillStyle = this.fontColor;
    ctx.font = this.font;
    ctx.textBaseline = 'middle';

    const lines = this.layout.lines;

    for (let i = 0; i < lines.length; i++) {
      const yPos = (i + 0.5) * this.lineHeight;
      const position = new Point(0, yPos);
      drawTextLine(ctx, lines[i] as string, position, 'center');
    }

    ctx.restore();
  }

  get contentsFit() {
    return true;
  }

  boundingBox() {
    return new BoundingBox(-this.width / 2, this.width / 2, 0, this.height);
  }

  distanceFrom(point: Point) {
    return point.vectorFromOrigin().distance();
  }
}
