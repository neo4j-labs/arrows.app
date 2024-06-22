import { Coordinate } from '@neo4j-arrows/model';
import { ImageInfo } from './ImageCache';
import { FontStyle } from '../FontStyle';

export interface DrawingContext {
  save(className?: string): void;

  restore(): void;

  translate(dx: number, dy: number): void;

  scale(x: number): void;

  rotate(angle: number): void;

  beginPath(): void;

  closePath(): void;

  moveTo(x: number, y: number): void;

  lineTo(x: number, y: number): void;

  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise: boolean
  ): void;

  circle(
    x: number,
    y: number,
    radius: number,
    fill: boolean,
    stroke: boolean
  ): void;

  rect(
    x: number,
    y: number,
    width: number,
    height: number,
    r: number,
    fill: boolean,
    stroke: boolean
  ): void;

  image(
    imageInfo: ImageInfo,
    x: number,
    y: number,
    width: number,
    height: number
  ): void;

  imageInCircle(
    imageInfo: ImageInfo,
    cx: number,
    cy: number,
    radius: number
  ): void;

  polyLine(points: Coordinate[]): void;

  polygon(points: Coordinate[], fill: boolean, stroke: boolean): void;

  stroke(): void;

  fill(): void;

  fillText(text: string, x: number, y: number): void;

  measureText(text: string): TextMetrics;

  setLineDash(dash: number[]): void;

  set fillStyle(color: string | CanvasGradient | CanvasPattern);

  set font(style: FontStyle);

  set textBaseline(value: CanvasTextBaseline);

  set textAlign(value: CanvasTextAlign);

  set lineWidth(value: number);

  set lineJoin(value: CanvasLineJoin);

  set lineCap(value: CanvasLineCap);

  set strokeStyle(value: string | CanvasGradient | CanvasPattern);
}
