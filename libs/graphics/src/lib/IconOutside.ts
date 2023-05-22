import {Point, StyleFunction} from "@neo4j-arrows/model";
import {BoundingBox} from "./utils/BoundingBox";
import {selectionBorder, selectionHandle} from "@neo4j-arrows/model";
import {Icon} from "./Icon";
import {adaptForBackground} from "./backgroundColorAdaption";
import { TextOrientation } from "./circumferentialTextAlignment";
import { ImageInfo } from "./utils/ImageCache";
import { CanvasAdaptor } from "./utils/CanvasAdaptor";
import { DrawingContext } from "./utils/DrawingContext";

export class IconOutside {
  orientation: TextOrientation;
  editing: boolean;
  icon: Icon;
  width: number;
  height: number;
  boxPosition: Point;
  selectionColor: string;
  constructor(imageKey:string, orientation:TextOrientation, editing:boolean, style:StyleFunction, imageCache:Record<string, ImageInfo>) {
    this.orientation = orientation
    this.editing = editing
    this.icon = new Icon(imageKey, style, imageCache)
    this.width = this.icon.width
    this.height = this.icon.height
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
    this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style)
  }

  get type() {
    return 'ICON'
  }

  draw(ctx:DrawingContext) {
    if (this.editing) return

    this.icon.draw(ctx, this.boxPosition.x, this.boxPosition.y)
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