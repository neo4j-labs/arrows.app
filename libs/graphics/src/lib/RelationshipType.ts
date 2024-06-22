import {
  StyleFunction,
  selectionBorder,
  selectionHandle,
} from '@neo4j-arrows/model';
import { Point } from '@neo4j-arrows/model';
import { BoundingBox } from './utils/BoundingBox';
import { adaptForBackground } from './backgroundColorAdaption';
import { TextOrientation } from './circumferentialTextAlignment';
import { TextMeasurementContext } from './utils/TextMeasurementContext';
import { FontStyle } from './FontStyle';
import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { DrawingContext } from './utils/DrawingContext';

export class RelationshipType {
  text: string;
  editing: boolean;
  padding: number;
  borderWidth: number;
  fontColor: string;
  borderColor: string;
  backgroundColor: string;
  selectionColor: any;
  font: FontStyle;
  width: number;
  height: any;
  boxPosition: Point;
  constructor(
    text: string,
    orientation: TextOrientation,
    editing: boolean,
    style: StyleFunction,
    textMeasurement: TextMeasurementContext
  ) {
    this.text = text;
    this.editing = editing;
    this.padding = style('type-padding') as number;
    this.borderWidth = style('type-border-width') as number;
    this.fontColor = style('type-color') as string;
    this.borderColor = style('type-border-color') as string;
    this.backgroundColor = style('type-background-color') as string;
    this.selectionColor = adaptForBackground(
      this.editing ? selectionHandle : selectionBorder,
      style
    );
    this.font = {
      fontWeight: 'normal',
      fontSize: style('type-font-size') as number,
      fontFamily: style('font-family') as string,
    };
    textMeasurement.font = this.font;
    const textWidth = textMeasurement.measureText(text).width;
    this.width = textWidth + (this.padding + this.borderWidth) * 2;
    this.height = this.font.fontSize + (this.padding + this.borderWidth) * 2;
    const horizontalPosition = (() => {
      switch (orientation.horizontal) {
        case 'start':
          return 0;
        case 'center':
          return -this.width / 2;
        case 'end':
          return -this.width;
      }
    })();
    this.boxPosition = new Point(horizontalPosition, 0);
  }

  get type() {
    return 'TYPE';
  }

  draw(ctx: DrawingContext) {
    if (this.text) {
      ctx.save();
      ctx.translate(...this.boxPosition.xy);
      ctx.fillStyle = this.backgroundColor;
      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = this.borderWidth;
      ctx.rect(
        this.borderWidth / 2,
        this.borderWidth / 2,
        this.width - this.borderWidth,
        this.height - this.borderWidth,
        this.padding,
        true,
        this.borderWidth > 0
      );
      if (!this.editing) {
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.font = this.font;
        ctx.fillStyle = this.fontColor;
        ctx.fillText(
          this.text,
          this.borderWidth + this.padding,
          this.height / 2
        );
      }
      ctx.restore();
    }
  }

  drawSelectionIndicator(ctx: DrawingContext) {
    if (this.text) {
      const indicatorWidth = 10;
      ctx.save();
      ctx.translate(...this.boxPosition.xy);
      ctx.strokeStyle = this.selectionColor;
      ctx.lineWidth = indicatorWidth;
      ctx.rect(
        this.borderWidth / 2,
        this.borderWidth / 2,
        this.width - this.borderWidth,
        this.height - this.borderWidth,
        this.padding,
        false,
        true
      );
      ctx.restore();
    }
  }

  boundingBox() {
    const left = this.boxPosition.x;
    const top = this.boxPosition.y;

    return new BoundingBox(left, left + this.width, top, top + this.height);
  }

  distanceFrom(point: Point) {
    return this.boundingBox().contains(point) ? 0 : Infinity;
  }
}
