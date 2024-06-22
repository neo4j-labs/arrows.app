export const byAscendingError = (a, b) => a.error - b.error;

export class Guides {
  constructor(guidelines = [], naturalPosition, naturalRadius) {
    this.guidelines = guidelines;
    this.naturalPosition = naturalPosition;
    this.naturalRadius = naturalRadius;
  }
}
