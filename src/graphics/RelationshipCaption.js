import {green} from "../model/colors";
import {Point} from "../model/Point";
import {getDistanceToLine} from "./utils/geometryUtils";

export class RelationshipCaption {
  constructor(text, arrow, editing, style, textMeasurement) {
    this.text = text
    this.editing = editing
    this.orientation = style('type-orientation')
    this.padding = style('type-padding')
    this.borderWidth = style('type-border-width')
    this.fontColor = style('type-color')
    this.borderColor = style('type-border-color')
    this.backgroundColor = style('type-background-color')
    this.midPoint = arrow.midPoint()
    this.textAngle = this.orientation === 'horizontal' ? 0 : arrow.shaftAngle()
    if (this.textAngle > Math.PI / 2 || this.textAngle < -Math.PI / 2) this.textAngle += Math.PI
    this.font = {
      fontWeight: 'normal',
      fontSize: style('type-font-size'),
      fontFace: 'sans-serif'
    }
    textMeasurement.font = this.font
    const textWidth = textMeasurement.measureText(text).width
    this.width = textWidth + this.padding * 2 + this.borderWidth
    this.height = this.font.fontSize + this.padding * 2 + this.borderWidth
    this.offset = this.orientation === 'above' ? -this.height / 2 : 0
  }

  distanceFrom(point) {
    const [startPoint, endPoint] = (
      [new Point(-this.width / 2, this.offset), new Point(this.width / 2, this.offset)])
      .map(point => point.rotate(this.textAngle).translate(this.midPoint.vectorFromOrigin()))
    const distance = getDistanceToLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, point.x, point.y)
    return Math.max(0, distance - (this.text ? this.height / 2 : 0))
  }

  draw(ctx) {
    if (this.text) {
      ctx.save()
      ctx.translate(this.midPoint.x, this.midPoint.y)
      ctx.rotate(this.textAngle)
      ctx.translate(0, this.offset)
      ctx.fillStyle = this.backgroundColor
      ctx.strokeStyle = this.borderColor
      ctx.lineWidth = this.borderWidth
      if (this.orientation !== 'above') {
        ctx.rect(
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height,
          this.padding,
          true,
          this.borderWidth > 0
        )
      }
      if (!this.editing) {
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.font = this.font
        ctx.fillStyle = this.fontColor
        ctx.fillText(this.text, 0, 0)
      }
      ctx.restore()
    }
  }

  drawSelectionIndicator(ctx) {
    if (this.text) {
      const indicatorWidth = 10
      ctx.save()
      ctx.translate(this.midPoint.x, this.midPoint.y)
      ctx.rotate(this.textAngle)
      ctx.translate(0, this.offset)
      ctx.strokeStyle = green
      ctx.lineWidth = indicatorWidth
      ctx.rect(
        -this.width / 2 -this.borderWidth / 2,
        -this.height / 2 -this.borderWidth / 2,
        this.width + this.borderWidth,
        this.height + this.borderWidth,
        this.padding,
        false,
        true
      )
      ctx.restore()
    }
  }
}