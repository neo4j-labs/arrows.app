import { Point, StyleFunction } from '@neo4j-arrows/model';
import { BoundingBox } from './utils/BoundingBox';
import { drawTextLine } from './canvasRenderer';
import { selectionBorder, selectionHandle } from '@neo4j-arrows/model';
import { adaptForBackground } from './backgroundColorAdaption';
import { TextMeasurementContext } from './utils/TextMeasurementContext';
import { FontStyle } from './FontStyle';
import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { DrawingContext } from './utils/DrawingContext';

export interface KeyValuePair {
  key: string;
  value: string;
}

export class PropertiesBox {
  editing: boolean;
  font: FontStyle;
  fontColor: string;
  selectionColor: string;
  lineHeight: number;
  alignment: string;
  properties: KeyValuePair[];
  spaceWidth: number;
  colonWidth: number;
  keysWidth = 0;
  valuesWidth = 0;
  boxWidth = 0;
  boxHeight: number;
  constructor(
    properties: Record<string, string>,
    editing: boolean,
    style: StyleFunction,
    textMeasurement: TextMeasurementContext
  ) {
    this.editing = editing;
    this.font = {
      fontWeight: style('property-font-weight') as string,
      fontSize: style('property-font-size') as number,
      fontFamily: style('font-family') as string,
    };
    textMeasurement.font = this.font;
    this.fontColor = style('property-color') as string;
    this.selectionColor = adaptForBackground(
      this.editing ? selectionHandle : selectionBorder,
      style
    );
    this.lineHeight = this.font.fontSize * 1.2;
    this.alignment = style('property-alignment') as string;
    this.properties = Object.keys(properties).map((key) => ({
      key,
      value: properties[key],
    }));
    this.spaceWidth = textMeasurement.measureText(' ').width;
    this.colonWidth = textMeasurement.measureText(':').width;
    const maxWidth = (selector: (s: KeyValuePair) => string) => {
      if (this.properties.length === 0) return 0;
      return Math.max(
        ...this.properties.map((property) => {
          return textMeasurement.measureText(selector(property)).width;
        })
      );
    };

    switch (this.editing ? 'colon' : this.alignment) {
      case 'colon':
        this.keysWidth = maxWidth((property) => property.key) + this.spaceWidth;
        this.valuesWidth =
          maxWidth((property) => property.value) + this.spaceWidth;
        this.boxWidth =
          this.keysWidth + this.colonWidth + this.spaceWidth + this.valuesWidth;
        break;

      case 'center':
        this.boxWidth = maxWidth(
          (property) => property.key + ': ' + property.value
        );
        break;
    }
    this.boxHeight = this.lineHeight * this.properties.length;
  }

  get isEmpty() {
    return this.properties.length === 0;
  }

  draw(ctx: DrawingContext) {
    ctx.save();

    ctx.font = this.font;
    ctx.fillStyle = this.fontColor;
    ctx.textBaseline = 'middle';

    this.properties.forEach((property, index) => {
      const yPosition = (index + 0.5) * this.lineHeight;
      if (this.editing) {
        drawTextLine(
          ctx,
          ':',
          new Point(this.keysWidth + this.colonWidth, yPosition),
          'end'
        );
      } else {
        switch (this.alignment) {
          case 'colon':
            drawTextLine(
              ctx,
              property.key + ':',
              new Point(this.keysWidth + this.colonWidth, yPosition),
              'end'
            );
            drawTextLine(
              ctx,
              property.value,
              new Point(
                this.keysWidth + this.colonWidth + this.spaceWidth,
                yPosition
              ),
              'start'
            );
            break;

          case 'center':
            drawTextLine(
              ctx,
              property.key + ': ' + property.value,
              new Point(this.boxWidth / 2, yPosition),
              'center'
            );
            break;
        }
      }
    });

    ctx.restore();
  }

  drawBackground(ctx: DrawingContext) {
    const boundingBox = this.boundingBox();
    ctx.fillStyle = 'white';
    ctx.rect(
      boundingBox.left,
      boundingBox.top,
      boundingBox.width,
      boundingBox.height,
      0,
      true,
      false
    );
  }

  drawSelectionIndicator(ctx: DrawingContext) {
    const indicatorWidth = 10;
    const boundingBox = this.boundingBox();

    ctx.save();

    ctx.strokeStyle = this.selectionColor;
    ctx.lineWidth = indicatorWidth;
    ctx.lineJoin = 'round';
    ctx.rect(
      boundingBox.left,
      boundingBox.top,
      boundingBox.width,
      boundingBox.height,
      0,
      false,
      true
    );

    ctx.restore();
  }

  boundingBox() {
    return new BoundingBox(0, this.boxWidth, 0, this.boxHeight);
  }
}
