import {drawTextLine} from "./canvasRenderer";
import {fitTextToRectangle} from "./utils/rectangleWordWrap";
import {Point, StyleFunction} from "@neo4j-arrows/model";
import {BoundingBox} from "./utils/BoundingBox";
import {selectionBorder, selectionHandle} from "@neo4j-arrows/model";
import {adaptForBackground} from "./backgroundColorAdaption";
import { TextOrientation } from "./circumferentialTextAlignment";
import { TextMeasurementContext } from "./utils/TextMeasurementContext";
import { FontStyle } from "./FontStyle";
import { CanvasAdaptor } from "./utils/CanvasAdaptor";
import { DrawingContext } from "./utils/DrawingContext";

export class NodeCaptionOutsideNode {
  caption: string;
  orientation: TextOrientation;
  editing: boolean;
  font: FontStyle;
  fontColor: string;
  selectionColor: string;
  lineHeight: number;
  layout: { actualWidth: number; margin: number; lines: (string | undefined)[]; };
  width: number;
  height: number;
  boxPosition: Point;
  constructor(caption:string, orientation:TextOrientation, editing:boolean, style:StyleFunction, textMeasurement:TextMeasurementContext) {
    this.caption = caption
    this.orientation = orientation
    this.editing = editing
    this.font = {
      fontWeight: style('caption-font-weight') as string,
      fontSize: style('caption-font-size') as number,
      fontFamily: style('font-family') as string
    }
    textMeasurement.font = this.font
    this.fontColor = style('caption-color') as string
    this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style)
    this.lineHeight = this.font.fontSize * 1.2
    const measureWidth = (s:string) => textMeasurement.measureText(s).width;
    this.layout = fitTextToRectangle(caption, style('caption-max-width') as number, measureWidth)
    this.width = this.layout.actualWidth
    this.height = this.layout.lines.length * this.lineHeight
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
    return 'CAPTION'
  }

  draw(ctx:DrawingContext) {
    if (this.editing) return

    ctx.save()

    ctx.fillStyle = this.fontColor
    ctx.font = this.font
    ctx.textBaseline = 'middle'

    const lines = this.layout.lines

    for (let i = 0; i< lines.length; i++) {
      const yPos = (i + 0.5) * this.lineHeight
      const position = new Point(0, yPos)
      drawTextLine(ctx, lines[i] as string, position, this.orientation.horizontal)
    }

    ctx.restore()
  }

  drawSelectionIndicator(ctx:DrawingContext) {
    const indicatorWidth = 10
    const boundingBox = this.boundingBox()
    ctx.save()
    ctx.strokeStyle = this.selectionColor
    ctx.lineWidth = indicatorWidth
    ctx.lineJoin = 'round'
    ctx.rect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height, 0, false, true)
    ctx.restore()
  }

  get contentsFit() {
    return true
  }

  boundingBox() {
    const left = this.boxPosition.x
    const top = this.boxPosition.y

    return new BoundingBox(left, left + this.width, top, top + this.height)
  }

  distanceFrom(point:Point) {
    return this.boundingBox().contains(point) ? 0 : Infinity
  }
}