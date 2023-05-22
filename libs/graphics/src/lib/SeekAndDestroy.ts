import {normaliseAngle} from "./utils/angles";
import {Point, Vector} from "@neo4j-arrows/model";
import {getDistanceToLine} from "./utils/geometryUtils";
import { CanvasAdaptor } from "./utils/CanvasAdaptor";
import { DrawingContext } from "./utils/DrawingContext";

export interface Waypoint {
  point: Point
  distance: number
  turn: number
  radius: number
}

export class SeekAndDestroy {
  waypoints: Waypoint[];
  start: Point;
  position: Point;
  startDirection: number;
  direction: number;
  end: Point;
  endDirection: number;

  constructor(start:Point, startDirection:number, end:Point, endDirection:number) {
    this.waypoints = []
    this.start = start
    this.position = start
    this.startDirection = startDirection
    this.direction = startDirection
    this.end = end
    this.endDirection = endDirection
  }

  forwardToWaypoint(distance:number, turn:number, radius:number) {
    this.position = this.position.translate(new Vector(distance, 0).rotate(this.direction))
    this.direction = normaliseAngle(this.direction + turn)
    this.waypoints.push({point: this.position, distance, turn, radius })
  }

  get endRelative() {
    return this.end.translate(this.position.vectorFromOrigin().invert()).rotate(-this.direction)
  }

  get endDirectionRelative() {
    return normaliseAngle(this.endDirection - this.direction)
  }

  get rightAngleTowardsEnd() {
    return this.endRelative.y < 0 ? -Math.PI / 2 : Math.PI / 2
  }

  segment(i:number) {
    const from = i === 0 ? this.start : this.waypoints[i - 1].point
    const to = i < this.waypoints.length ? this.waypoints[i].point : this.end
    return { from, to }
  }

  nextPoint(i:number) {
    if (i + 1 < this.waypoints.length) {
      const waypoint = this.waypoints[i]
      const nextWaypoint = this.waypoints[i + 1].point
      const nextVector = nextWaypoint.vectorFrom(waypoint.point)
      return waypoint.point.translate(nextVector.scale(0.5))
    }
    return this.end
  }

  get polarity() {
    if (this.waypoints.length === 0) {
      return 0
    }
    return Math.sign(this.waypoints[0].turn)
  }

  changeEnd(newEnd:Point) {
    const path = new SeekAndDestroy(this.start, this.startDirection, newEnd, this.endDirection)
    path.waypoints = this.waypoints
    return path
  }

  inverse() {
    const path = new SeekAndDestroy(
      this.end,
      normaliseAngle(this.endDirection + Math.PI),
      this.start,
      normaliseAngle(this.startDirection + Math.PI)
    )
    for (let i = this.waypoints.length - 1; i >= 0; i--) {
      const waypoint = this.waypoints[i]
      path.forwardToWaypoint(
        waypoint.point.vectorFrom(path.position).distance(),
        -waypoint.turn,
        waypoint.radius
      )
    }
    return path
  }

  draw(ctx:DrawingContext) {
    ctx.moveTo(...this.start.xy)
    let previous = this.start
    for (let i = 0; i < this.waypoints.length; i++) {
      const waypoint = this.waypoints[i]
      const next = this.nextPoint(i)
      let control = waypoint.point
      const vector1 = previous.vectorFrom(control)
      const vector2 = next.vectorFrom(control)
      const d = waypoint.radius * Math.tan(Math.abs(waypoint.turn) / 2);
      if (vector1.distance() < d) {
        const overlap = d - vector1.distance()
        control = control.translate(vector2.scale(overlap / vector2.distance()))
      }
      if (vector2.distance() < d) {
        const overlap = d - vector2.distance()
        control = control.translate(vector1.scale(overlap / vector1.distance()))
      }

      ctx.arcTo(...control.xy, ...next.xy, waypoint.radius)
      previous = next
    }
    ctx.lineTo(...this.end.xy)
  }

  distanceFrom(point:Point) {
    let minDistance = Infinity
    for (let i = 0; i < this.waypoints.length + 1; i++) {
      const segment = this.segment(i)
      const distance = getDistanceToLine(...segment.from.xy, ...segment.to.xy, ...point.xy)
      minDistance = Math.min(distance, minDistance)
    }
    return minDistance
  }
}

export const compareWaypoints = (a:Waypoint[], b:Waypoint[]):number => {
  if (a.length === 0 && b.length === 0) return 0

  if (a.length === 0) {
    return -Math.sign(b[0].turn)
  }

  if (b.length === 0) {
    return Math.sign(a[0].turn)
  }

  const aFirstWaypoint = a[0]
  const bFirstWaypoint = b[0]

  if (aFirstWaypoint.turn !== bFirstWaypoint.turn) {
    return Math.sign(aFirstWaypoint.turn - bFirstWaypoint.turn)
  }

  if (Math.abs(aFirstWaypoint.distance - bFirstWaypoint.distance) > 0.0001) {
    return Math.sin(a[0].turn) * Math.sign(bFirstWaypoint.distance - aFirstWaypoint.distance)
  }

  return compareWaypoints(a.slice(1), b.slice(1))
}