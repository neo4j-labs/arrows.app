import {getDistanceToLine} from "./utils/geometryUtils";
import {Point} from "../model/Point";
import {Vector} from "../model/Vector";

// This doesn't really draw arcs. It's a placeholder until I have time to put curves back in.
export class ArcArrow {

  constructor(startCentre, endCentre, deflection, startRadius, endRadius, arrowWidth, headWidth, headHeight, arrowColor) {
    this.startCentre = startCentre
    const interNodeVector = endCentre.vectorFrom(startCentre)
    const centreDistance = interNodeVector.distance()
    this.angle = interNodeVector.angle()
    this.arrowWidth = arrowWidth
    this.arrowColor = arrowColor

    const deflectionRadians = deflection * Math.PI / 180
    this.startAttach = startCentre.translate(new Vector(startRadius, 0).rotate(this.angle + deflectionRadians))

    const effectiveEndRadius = endRadius + headHeight
    this.externalHomotheticCentre = new Point(0,0).translate(
      startCentre.vectorFromOrigin().scale(-effectiveEndRadius / (startRadius - effectiveEndRadius))
        .plus(
          endCentre.vectorFromOrigin().scale(startRadius / (startRadius - effectiveEndRadius))
        ))

    const EC = startCentre.vectorFrom(this.externalHomotheticCentre).distance()
    const ED = endCentre.vectorFrom(this.externalHomotheticCentre).distance()
    const EP = this.startAttach.vectorFrom(this.externalHomotheticCentre).distance()
    const EQ = EC * ED / EP

    this.endAttach = this.externalHomotheticCentre.translate(this.startAttach.vectorFrom(this.externalHomotheticCentre).scale(EQ / EP))

    // const radiusRatio = startRadius / (endRadius + headHeight)
    // const homotheticCenter = -centreDistance * radiusRatio / (1 - radiusRatio)
    //
    // const square = (a) => a * a
    // const intersectWithOtherCircle = (fixedPoint, radius, xCenter, polarity) => {
    //   const gradient = fixedPoint.y / (fixedPoint.x - homotheticCenter)
    //   const hc = fixedPoint.y - gradient * fixedPoint.x
    //
    //   const A = 1 + square(gradient)
    //   const B = 2 * (gradient * hc - xCenter)
    //   const C = square(hc) + square(xCenter) - square(radius)
    //
    //   const x = (-B + polarity * Math.sqrt(square(B) - 4 * A * C)) / (2 * A)
    //   return new Point(x, (x - homotheticCenter) * gradient)
    // }
    //
    // const endAttach = intersectWithOtherCircle(startAttach, endRadius + headHeight, centreDistance, -1)
    //
    // const g1 = -startAttach.x / startAttach.y
    // const c1 = startAttach.y + (square(startAttach.x) / startAttach.y)
    // const g2 = -(endAttach.x - centreDistance) / endAttach.y
    // const c2 = endAttach.y + (endAttach.x - centreDistance) * endAttach.x / endAttach.y
    //
    // const cx = ( c1 - c2 ) / (g2 - g1)
    // const cy = g1 * cx + c1

    // this.arcCentre = new Point(homotheticCenter, 0)
    // this.arcRadius = startAttach.vectorFrom(this.arcCentre).distance()
    // this.startAngle = startAttach.vectorFrom(this.arcCentre).angle()
    // this.endAngle = endAttach.vectorFrom(this.arcCentre).angle()
  }

  distanceFrom(point) {
    return 100000000
    // const transform = logicalPoint => {
    //   return logicalPoint
    //     .rotate(this.angle)
    //     .translate(this.startCentre.vectorFromOrigin())
    // }
    // const startPoint = transform(new Point(this.startArrow, 0))
    // const endPoint = transform(new Point(this.endArrow, 0))
    // return getDistanceToLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, point.x, point.y)
  }

  draw(ctx) {
    ctx.save()
    ctx.beginPath()
    ctx.fillStyle = 'red'
    ctx.arc(this.externalHomotheticCentre.x, this.externalHomotheticCentre.y, 10, 0, 2 * Math.PI)
    ctx.fill()

    ctx.beginPath()
    ctx.fillStyle = 'blue'
    ctx.arc(this.startAttach.x, this.startAttach.y, 10, 0, 2 * Math.PI)
    ctx.fill()

    ctx.beginPath()
    ctx.fillStyle = 'green'
    ctx.arc(this.endAttach.x, this.endAttach.y, 10, 0, 2 * Math.PI)
    ctx.fill()

    // ctx.translate(this.startCentre.x, this.startCentre.y)
    // ctx.rotate(this.angle)
    // ctx.beginPath()
    // ctx.arc(this.arcCentre.x, this.arcCentre.y, this.arcRadius, this.startAngle, this.endAngle, false)
    // ctx.lineWidth = this.arrowWidth
    // ctx.strokeStyle = this.arrowColor
    // ctx.stroke()
    ctx.restore()
  }
}