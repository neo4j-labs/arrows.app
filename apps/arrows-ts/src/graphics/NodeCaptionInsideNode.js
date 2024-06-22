import { drawTextLine } from './canvasRenderer';
import { Point } from '../model/Point';
import BoundingBox from './utils/BoundingBox';
import { fitTextToRectangle } from './utils/rectangleWordWrap';

export class NodeCaptionInsideNode {
  constructor(caption, editing, style, textMeasurement) {
    this.editing = editing;
    this.font = {
      fontWeight: style('caption-font-weight'),
      fontSize: style('caption-font-size'),
      fontFamily: style('font-family'),
    };
    textMeasurement.font = this.font;
    this.fontColor = style('caption-color');
    this.orientation = { horizontal: 'center', vertical: 'center' };
    this.lineHeight = this.font.fontSize * 1.2;
    const measureWidth = (string) => textMeasurement.measureText(string).width;
    this.layout = fitTextToRectangle(
      caption,
      style('caption-max-width'),
      measureWidth
    );
    this.width = this.layout.actualWidth;
    this.height = this.layout.lines.length * this.lineHeight;
  }

  get type() {
    return 'CAPTION';
  }

  draw(ctx) {
    if (this.editing) return;

    ctx.save();

    ctx.fillStyle = this.fontColor;
    ctx.font = this.font;
    ctx.textBaseline = 'middle';

    const lines = this.layout.lines;

    for (let i = 0; i < lines.length; i++) {
      const yPos = (i + 0.5) * this.lineHeight;
      const position = new Point(0, yPos);
      drawTextLine(ctx, lines[i], position, 'center');
    }

    ctx.restore();
  }

  get contentsFit() {
    return true;
  }

  boundingBox() {
    return new BoundingBox(-this.width / 2, this.width / 2, 0, this.height);
  }

  distanceFrom(point) {
    return point.vectorFromOrigin().distance();
  }
}
