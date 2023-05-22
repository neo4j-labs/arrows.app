import {Coordinate, StyleFunction, selectionBorder, selectionHandle} from "@neo4j-arrows/model";
import {ImageInfo, getCachedImage} from "./utils/ImageCache";
import {adaptForBackground} from "./backgroundColorAdaption";
import { CanvasAdaptor } from "./utils/CanvasAdaptor";
import { DrawingContext } from "./utils/DrawingContext";

export class NodeBackground {
  position: Coordinate;
  internalRadius: number;
  editing: boolean;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  selectionColor: string;
  imageInfo: ImageInfo | undefined;
  constructor(position:Coordinate, internalRadius:number, editing:boolean, style:StyleFunction, imageCache:Record<string, ImageInfo>) {
    this.position = position;
    this.internalRadius = internalRadius;
    this.editing = editing
    this.backgroundColor = style('node-color') as string
    this.borderWidth = style('border-width') as number
    this.borderColor = style('border-color') as string
    this.selectionColor = adaptForBackground(this.editing ? selectionHandle : selectionBorder, style)
    const backgroundImageUrl = style('node-background-image') as string
    // eslint-disable-next-line no-extra-boolean-cast
    if (!!backgroundImageUrl) {
      this.imageInfo = getCachedImage(imageCache, backgroundImageUrl)
    }
  }

  draw(ctx:DrawingContext) {
    ctx.save()
    ctx.fillStyle = this.backgroundColor
    ctx.strokeStyle = this.borderColor
    ctx.lineWidth = this.borderWidth
    ctx.circle(this.position.x, this.position.y, this.internalRadius + this.borderWidth / 2, true, this.borderWidth > 0)
    // eslint-disable-next-line no-extra-boolean-cast
    if (!!this.imageInfo) {
      ctx.imageInCircle(this.imageInfo, this.position.x, this.position.y, this.internalRadius)
    }
    ctx.restore()
  }

  drawSelectionIndicator(ctx:DrawingContext) {
    ctx.save()
    const indicatorWidth = 10
    ctx.strokeStyle = this.selectionColor
    ctx.lineWidth = indicatorWidth
    ctx.circle(this.position.x, this.position.y, this.internalRadius + this.borderWidth, false, true)
    ctx.restore()
  }
}