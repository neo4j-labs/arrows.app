export class HandleGuide {
  constructor(handlePosition) {
    this.handlePosition = handlePosition;
  }

  get type() {
    return 'HANDLE';
  }
}
