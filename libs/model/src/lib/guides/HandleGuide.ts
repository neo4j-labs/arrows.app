import { Point } from '../Point';

export class HandleGuide {
  handlePosition: Point;

  constructor(handlePosition: Point) {
    this.handlePosition = handlePosition;
  }

  get type() {
    return 'HANDLE';
  }
}
