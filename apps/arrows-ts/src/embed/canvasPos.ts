import { Point } from '../model/Point';

export interface CanvasHit {
  canvas: HTMLCanvasElement;
  pos: Point;
}

export function canvasPosOf(e: MouseEvent | WheelEvent): CanvasHit | null {
  const target = e.target as HTMLElement | null;
  if (!target || target.tagName !== 'CANVAS') return null;
  const canvas = target as HTMLCanvasElement;
  const rect = canvas.getBoundingClientRect();
  return { canvas, pos: new Point(e.clientX - rect.left, e.clientY - rect.top) };
}

export function firstCanvas(): HTMLCanvasElement | null {
  return document.getElementsByTagName('canvas')[0] ?? null;
}
