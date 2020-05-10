import {normaliseAngle} from "./utils/angles";
import {Vector} from "../model/Vector";
import {getDistanceToLine} from "./utils/geometryUtils";

export class SeekAndDestroy {
  constructor(start, startDirection, end, endDirection) {
    this.waypoints = []
    this.start = start
    this.position = start
    this.direction = startDirection
    this.end = end
    this.endDirection = endDirection
  }

  forwardToWaypoint(distance, turn, radius) {
    this.position = this.position.translate(new Vector(distance, 0).rotate(this.direction))
    this.direction = normaliseAngle(this.direction + turn)
    this.waypoints.push({point: this.position, turn, radius })
  }

  get endRelative() {
    return this.end.translate(this.position.vectorFromOrigin().invert()).rotate(-this.direction)
  }

  get endDirectionRelative() {
    return normaliseAngle(this.endDirection - this.direction)
  }

  segment(i) {
    const from = i === 0 ? this.start : this.waypoints[i - 1].point
    const to = i < this.waypoints.length ? this.waypoints[i].point : this.end
    return { from, to }
  }

  draw(ctx) {
    ctx.moveTo(...this.start.xy)
    for (let i = 0; i < this.waypoints.length; i++) {
      const waypoint = this.waypoints[i]
      const nextWaypoint = i + 1 < this.waypoints.length ? this.waypoints[i + 1].point : this.end
      const halfway = waypoint.point.translate(nextWaypoint.vectorFrom(waypoint.point).scale(0.5))
      ctx.arcTo(...waypoint.point.xy, ...halfway.xy, waypoint.radius)
    }
    ctx.lineTo(...this.end.xy)
  }

  distanceFrom(point) {
    let minDistance = Infinity
    for (let i = 0; i < this.waypoints.length + 1; i++) {
      const segment = this.segment(i)
      const distance = getDistanceToLine(...segment.from.xy, ...segment.to.xy, ...point.xy)
      minDistance = Math.min(distance, minDistance)
    }
    return minDistance
  }

}