import {Point} from "../Point";
import { CircleGuide } from "./CircleGuide";
import { LineGuide } from "./LineGuide";

const isVertical = (line:{angle:number}) => {
  return Math.abs(Math.PI / 2 - Math.abs(line.angle)) < 0.01
}

const intersectVertical = (vertical:LineGuide, other:LineGuide) => {
  return {
    possible: true,
    intersection: new Point(
      vertical.center.x,
      Math.tan(other.angle) * (vertical.center.x - other.center.x) + other.center.y
    )
  }
}

export const areParallel = (lineA:LineGuide, lineB:LineGuide) => {
  return Math.abs((lineA.angle - lineB.angle) % Math.PI) < 0.01
}

export const intersectLineAndLine = (lineA:LineGuide, lineB:LineGuide) => {
  if (areParallel(lineA, lineB)) {
    return {
      possible: false
    }
  }
  if (isVertical(lineA)) {
    return intersectVertical(lineA, lineB)
  }
  if (isVertical(lineB)) {
    return intersectVertical(lineB, lineA)
  }
  const mA = Math.tan(lineA.angle)
  const mB = Math.tan(lineB.angle)
  const x = ((mA * lineA.center.x - mB * lineB.center.x) - (lineA.center.y - lineB.center.y)) / (mA - mB)
  return {
    possible: true,
    intersection: new Point(x, mA * (x - lineA.center.x) + lineA.center.y)
  }
}

const sq = (d:number) => d * d

const intersectVerticalLineAndCircle = (line:LineGuide, circle:CircleGuide, naturalPosition:Point) => {
  const dx = Math.abs(circle.center.x - line.center.x)
  if (dx > circle.radius) {
    return {
      possible: false
    }
  } else {
    const dy = Math.sqrt(circle.radius * circle.radius - dx * dx)
    const y = circle.center.y < naturalPosition.y ? circle.center.y + dy : circle.center.y - dy
    const intersection = new Point(line.center.x, y)
    return {
      possible: true,
      intersection
    }
  }
}

export const intersectLineAndCircle = (line:LineGuide, circle:CircleGuide, naturalPosition:Point) => {
  if (isVertical(line)) {
    return intersectVerticalLineAndCircle(line, circle, naturalPosition)
  }

  const m = Math.tan(line.angle)
  const n = line.center.y - m * line.center.x

  const a = 1 + sq(m)
  const b = -circle.center.x * 2 + (m * (n - circle.center.y)) * 2
  const c = sq(circle.center.x) + sq(n - circle.center.y) - sq(circle.radius)

  const d = sq(b) - 4 * a * c
  if (d >= 0) {
    const intersections = [
      (-b + Math.sqrt(d)) / (2 * a),
      (-b - Math.sqrt(d)) / (2 * a)
    ].map(x => new Point(x, m * x + n))
    const errors = intersections.map((point) => point.vectorFrom(naturalPosition).distance())
    const intersection = errors[0] < errors[1] ? intersections[0] : intersections[1]
    return {
      possible: true,
      intersection
    }
  } else {
    return {
      possible: false
    }
  }
}

export const intersectCircleAndCircle = (circleA:CircleGuide, circleB:CircleGuide, naturalPosition:Point) => {
  const betweenCenters = circleA.center.vectorFrom(circleB.center)
  const d = betweenCenters.distance()
  if (d > Math.abs(circleA.radius - circleB.radius) && d < circleA.radius + circleB.radius) {
    const a = (circleB.radius * circleB.radius - circleA.radius * circleA.radius + d * d) / (2 * d)
    const midPoint = circleB.center.translate(betweenCenters.scale(a / d))
    const h = Math.sqrt(circleB.radius * circleB.radius - a * a)
    const bisector = betweenCenters.perpendicular().scale(h / d)
    const intersections = [midPoint.translate(bisector), midPoint.translate(bisector.invert())]
    const errors = intersections.map((point) => point.vectorFrom(naturalPosition).distance())
    const intersection = errors[0] < errors[1] ? intersections[0] : intersections[1]
    return {
      possible: true,
      intersection
    }
  } else {
    return {
      possible: false
    }
  }
}