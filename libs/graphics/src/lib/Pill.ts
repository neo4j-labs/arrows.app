import {BoundingBox} from "./utils/BoundingBox";
import {StyleFunction, selectionBorder, selectionHandle} from "@neo4j-arrows/model";
import {Point} from "@neo4j-arrows/model";
import {adaptForBackground} from "./backgroundColorAdaption";
import { TextMeasurementContext } from "./utils/TextMeasurementContext";
import { FontStyle } from "./FontStyle";
import { CanvasAdaptor } from "./utils/CanvasAdaptor";
import { DrawingContext } from "./utils/DrawingContext";

export class Pill {
  text: string;
  backgroundColor: string;
  strokeColor: string;
  fontColor: string;
  selectionColor: string;
  editing: boolean;
  borderWidth: number;
  display: string;
  font: FontStyle;
  textWidth: number;
  height: number;
  radius: number;
  width: number;
  constructor(text:string, editing:boolean, style:StyleFunction, textMeasurement:TextMeasurementContext) {
    this.text = text

    this.editing = editing

    this.backgroundColor = style('label-background-color') as string
    this.strokeColor = style('label-border-color') as string
    this.fontColor = style('label-color') as string
    this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style)
    this.borderWidth = style('label-border-width') as number
    this.display = style('label-display') as string

    const padding = style('label-padding') as number

    this.font = {
      fontWeight: 'normal',
      fontSize: style('label-font-size') as number,
      fontFamily: style('font-family') as string
    }
    textMeasurement.font = this.font
    this.textWidth = textMeasurement.measureText(text).width

    this.height = this.font.fontSize + padding * 2 + this.borderWidth
    this.radius = this.display === 'pill' ? this.height / 2 : 0
    this.width = this.textWidth + this.radius * 2

  }

  draw(ctx:DrawingContext) {
    ctx.save()
    ctx.fillStyle = this.backgroundColor
    ctx.strokeStyle = this.strokeColor
    ctx.lineWidth = this.borderWidth
    if (this.display === 'pill') {
      ctx.rect(0, 0, this.width, this.height, this.radius, true, this.borderWidth > 0)
    }

    if (!this.editing) {
      ctx.font = this.font
      ctx.textBaseline = 'middle'
      ctx.fillStyle = this.fontColor
      ctx.fillText(this.text, this.radius, this.height / 2)
    }
    ctx.restore()
  }

  drawSelectionIndicator(ctx:DrawingContext) {
    const indicatorWidth = 10
    ctx.save()
    ctx.strokeStyle = this.selectionColor
    ctx.lineWidth = indicatorWidth
    ctx.lineJoin = 'round'
    ctx.rect(
      -this.borderWidth / 2, -this.borderWidth / 2,
      this.width + this.borderWidth, this.height + this.borderWidth,
      this.radius + this.borderWidth / 2, false, true
    )
    ctx.restore()
  }

  contains(localPoint:Point) {
    const rectangle = new BoundingBox(this.radius, this.width, 0, this.height)
    const leftCenter = new Point(this.radius, this.radius)
    const rightCenter = new Point(this.radius + this.width, this.radius)
    return rectangle.contains(localPoint) ||
      leftCenter.vectorFrom(localPoint).distance() < this.radius ||
      rightCenter.vectorFrom(localPoint).distance() < this.radius
  }

  boundingBox() {
    return new BoundingBox(
      -this.borderWidth / 2,
      this.width + this.borderWidth / 2,
      -this.borderWidth / 2,
      this.height + this.borderWidth / 2
    )
  }
}