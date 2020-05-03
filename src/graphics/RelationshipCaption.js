import {green} from "../model/colors";
import {Point} from "../model/Point";
import {getDistanceToLine} from "./utils/geometryUtils";
import {textAlignmentAtAngle} from "./circumferentialTextAlignment";
import {Vector} from "../model/Vector";

export class RelationshipCaption {
  constructor(text, arrow, editing, style, textMeasurement) {
    this.text = text
    this.editing = editing
    this.position = style('type-position')
    this.orientation = style('type-orientation')
    this.padding = style('type-padding')
    this.borderWidth = style('type-border-width')
    this.fontColor = style('type-color')
    this.borderColor = style('type-border-color')
    this.backgroundColor = style('type-background-color')
    this.midPoint = arrow.midPoint()
    this.textAngle = angleForOrientation(this.orientation, arrow.shaftAngle())
    if (this.textAngle > Math.PI / 2 || this.textAngle < -Math.PI / 2) this.textAngle += Math.PI
    this.textAlign = textAlignForPosition(this.position, this.orientation, arrow.shaftAngle())
    this.font = {
      fontWeight: 'normal',
      fontSize: style('type-font-size'),
      fontFace: 'sans-serif'
    }
    textMeasurement.font = this.font
    const textWidth = textMeasurement.measureText(text).width
    const spaceWidth = textMeasurement.measureText(' ').width
    this.width = textWidth + this.padding * 2 + this.borderWidth
    this.height = this.font.fontSize + this.padding * 2 + this.borderWidth
    this.offset = computeOffset(this.width, this.height, this.position, this.textAlign, spaceWidth)
  }

  distanceFrom(point) {
    const [startPoint, endPoint] = (
      [new Point(0, 0), new Point(this.width, 0)])
      .map(point => point.translate(this.offset).rotate(this.textAngle).translate(this.midPoint.vectorFromOrigin()))
    const distance = getDistanceToLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, point.x, point.y)
    return Math.max(0, distance - (this.text ? this.height / 2 : 0))
  }

  draw(ctx) {
    if (this.text) {
      ctx.save()
      ctx.translate(...this.midPoint.xy)
      ctx.rotate(this.textAngle)
      ctx.translate(...this.offset.dxdy)
      ctx.fillStyle = this.backgroundColor
      ctx.strokeStyle = this.borderColor
      ctx.lineWidth = this.borderWidth
      if (this.position === 'inline') {
        ctx.rect(
          0,
          0,
          this.width,
          this.height,
          this.padding,
          true,
          this.borderWidth > 0
        )
      }
      if (!this.editing) {
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'left'
        ctx.font = this.font
        ctx.fillStyle = this.fontColor
        ctx.fillText(this.text, this.padding, this.height / 2)
      }
      ctx.restore()
    }
  }

  drawSelectionIndicator(ctx) {
    if (this.text) {
      const indicatorWidth = 10
      ctx.save()
      ctx.translate(...this.midPoint.xy)
      ctx.rotate(this.textAngle)
      ctx.translate(...this.offset.dxdy)
      ctx.strokeStyle = green
      ctx.lineWidth = indicatorWidth
      ctx.rect(
        -this.borderWidth / 2,
        -this.borderWidth / 2,
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

const angleForOrientation = (orientation, shaftAngle) => {
  switch (orientation) {
    case 'parallel':
      return shaftAngle
    case 'perpendicular':
      return shaftAngle + Math.PI / 2
    default:
      return 0
  }
}

const textAlignForPosition = (position, orientation, shaftAngle) => {
  if (orientation === 'parallel' || orientation === 'perpendicular') {
    return 'center'
  }
  const positiveAngle = shaftAngle < 0 ? shaftAngle + Math.PI : shaftAngle
  const tolerance = Math.PI / 100
  if (positiveAngle < tolerance || positiveAngle > Math.PI - tolerance) {
    return 'center'
  }
  return textAlignmentAtAngle(positiveAngle).horizontal
}

const computeOffset = (width, height, position, textAlign, spaceWidth) => {
  let dx, dy

  switch (textAlign) {
    case 'left':
      dx = spaceWidth
      break
    case 'right':
      dx = -(spaceWidth + width)
      break
    default:
      dx = -(width / 2)
  }
  switch (position) {
    case 'above':
      dy = -height
      break
    case 'below':
      dy = 0
      break
    default:
      dy = -height / 2
  }
  return new Vector(dx, dy)
}