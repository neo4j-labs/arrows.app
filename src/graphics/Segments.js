import {getDistanceToLine} from "./utils/geometryUtils";

export class Segments {

  constructor(startPoint) {
    this.segments = []
    this.lastPoint = startPoint
  }

  addSegment(nextPoint) {
    this.segments.push({
      from: this.lastPoint,
      to: nextPoint
    })
    this.lastPoint = nextPoint
  }

  segment(index) {
    return this.segments[index]
  }

  distanceFrom(point) {
    return Math.min(...this.segments.map(segment => getDistanceToLine(...segment.from.xy, ...segment.to.xy, ...point.xy)))
  }
}