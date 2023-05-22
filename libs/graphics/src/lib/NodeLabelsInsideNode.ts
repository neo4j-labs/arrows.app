import { Point, StyleFunction, Vector } from "@neo4j-arrows/model";
import {Pill} from "./Pill";
import {combineBoundingBoxes} from "./utils/BoundingBox";
import { TextMeasurementContext } from "./utils/TextMeasurementContext";
import { CanvasAdaptor } from "./utils/CanvasAdaptor";
import { DrawingContext } from "./utils/DrawingContext";

export class NodeLabelsInsideNode {
  pills: Pill[];
  margin: number;
  pillPositions: Vector[];
  width: number;
  height: number;
  constructor(labels:string[], editing:boolean, style:StyleFunction, textMeasurement:TextMeasurementContext) {

    this.pills = labels.map((label) => {
      return new Pill(label, editing, style, textMeasurement)
    })

    this.margin = style('label-margin') as number
    let yPos = 0

    this.pillPositions = []
    for (let i = 0; i < this.pills.length; i++) {
      const pill = this.pills[i]
      this.pillPositions[i] = new Vector(
        -pill.width / 2,
        yPos
      )
      yPos += (pill.height + pill.borderWidth + this.margin)
    }

    this.width = this.pills.reduce((width, pill) => Math.max(width, pill.width), 0)
    this.height = this.pills.reduce((sum, pill) => sum + pill.height, 0) +
      this.margin * (this.pills.length - 1)
  }

  get type() {
    return 'LABELS'
  }

  get isEmpty() {
    return this.pills.length === 0
  }

  draw(ctx:DrawingContext) {
    for (let i = 0; i < this.pills.length; i++) {
      ctx.save()

      ctx.translate(...this.pillPositions[i].dxdy)
      this.pills[i].draw(ctx)

      ctx.restore()
    }
  }

  boundingBox() {
    return combineBoundingBoxes(this.pills.map((pill, i) => pill.boundingBox()
      .translate(this.pillPositions[i])))
  }

  distanceFrom(point:Point) {
    return this.pills.some((pill, i) => {
      const localPoint = point.translate(this.pillPositions[i].invert())
      return pill.contains(localPoint);
    }) ? 0 : Infinity
  }
}