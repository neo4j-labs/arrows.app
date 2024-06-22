import { Point, StyleFunction, Vector } from '@neo4j-arrows/model';
import { Pill } from './Pill';
import { combineBoundingBoxes } from './utils/BoundingBox';
import { TextMeasurementContext } from './utils/TextMeasurementContext';
import { TextOrientation } from './circumferentialTextAlignment';
import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { DrawingContext } from './utils/DrawingContext';

export class NodeLabelsOutsideNode {
  pills: Pill[];
  margin: number;
  pillPositions: Vector[];
  width: number;
  height: number;
  constructor(
    labels: string[],
    orientation: TextOrientation,
    editing: boolean,
    style: StyleFunction,
    textMeasurement: TextMeasurementContext
  ) {
    this.pills = labels.map((label) => {
      return new Pill(label, editing, style, textMeasurement);
    });

    this.margin = style('label-margin') as number;

    if (labels.length > 0) {
      const lineHeight =
        this.pills[0].height + this.margin + this.pills[0].borderWidth;

      this.pillPositions = this.pills.map((pill, i) => {
        const pillWidth = pill.width + pill.borderWidth;
        const horizontalPosition = (() => {
          switch (orientation.horizontal) {
            case 'start':
              return 0;
            case 'center':
              return -pillWidth / 2;
            case 'end':
              return -pillWidth;
          }
        })();
        return new Vector(horizontalPosition, i * lineHeight);
      });
    } else {
      this.pillPositions = [];
    }

    this.width = Math.max(
      ...this.pills.map((pill) => pill.width + pill.borderWidth)
    );
    const lastPillIndex = this.pills.length - 1;
    this.height =
      this.pillPositions[lastPillIndex].dy +
      this.pills[lastPillIndex].height +
      this.pills[lastPillIndex].borderWidth;
  }

  get type() {
    return 'LABELS';
  }

  get isEmpty() {
    return this.pills.length === 0;
  }

  draw(ctx: DrawingContext) {
    for (let i = 0; i < this.pills.length; i++) {
      ctx.save();

      ctx.translate(...this.pillPositions[i].dxdy);
      this.pills[i].draw(ctx);

      ctx.restore();
    }
  }

  drawSelectionIndicator(ctx: DrawingContext) {
    for (let i = 0; i < this.pills.length; i++) {
      ctx.save();

      ctx.translate(...this.pillPositions[i].dxdy);
      this.pills[i].drawSelectionIndicator(ctx);

      ctx.restore();
    }
  }

  boundingBox() {
    return combineBoundingBoxes(
      this.pills.map((pill, i) =>
        pill.boundingBox().translate(this.pillPositions[i])
      )
    );
  }

  distanceFrom(point: Point) {
    return this.pills.some((pill, i) => {
      const localPoint = point.translate(this.pillPositions[i].invert());
      return pill.contains(localPoint);
    })
      ? 0
      : Infinity;
  }
}
