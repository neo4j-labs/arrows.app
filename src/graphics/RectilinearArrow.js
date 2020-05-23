import {green} from "../model/colors";
import arrowHead from "./arrowHead";
import {Vector} from "../model/Vector";
import {SeekAndDestroy} from "./SeekAndDestroy";
import {normaliseAngle} from "./utils/angles";

export class RectilinearArrow {
  constructor(startCentre, endCentre, startRadius, endRadius, startAttachment, endAttachment, dimensions) {
    this.dimensions = dimensions
    const arcRadius = startAttachment.total > endAttachment.total ? computeArcRadius(startAttachment) : computeArcRadius(endAttachment)
    const startAttachAngle = startAttachment.attachment.angle
    const endAttachAngle = endAttachment.attachment.angle
    this.startAttach = startCentre.translate(new Vector(startRadius, (startAttachment.ordinal - (startAttachment.total - 1) / 2) * 10).rotate(startAttachAngle))
    this.endShaft = endCentre.translate(new Vector(endRadius + this.dimensions.headHeight - this.dimensions.chinHeight, (endAttachment.ordinal - (endAttachment.total - 1) / 2) * 10).rotate(endAttachAngle))

    const fanOut = startAttachment.total > endAttachment.total

    this.path = new SeekAndDestroy(this.startAttach, startAttachAngle, this.endShaft, normaliseAngle(endAttachAngle + Math.PI))

    const initialAngle = Math.abs(Math.round(this.path.endDirectionRelative * 180 / Math.PI))
    switch (initialAngle) {
      case 0:
        if (this.path.endRelative.x > 0) {
          if (this.path.endRelative.y === 0) {
            this.midShaft = this.startAttach.translate(this.endShaft.vectorFrom(this.startAttach).scale(0.5))
            this.midShaftAngle = startAttachAngle
          } else {
            const distance = this.path.endRelative.x < arcRadius * 2 ? this.path.endRelative.x / 2 :
              (fanOut ? arcRadius : this.path.endRelative.x - arcRadius)
            this.path.forwardToWaypoint(distance, this.path.rightAngleTowardsEnd, arcRadius)
            this.path.forwardToWaypoint(this.path.endRelative.x, this.path.rightAngleTowardsEnd, arcRadius)

            const longestSegment = this.path.segment(fanOut ? 2 : 0)
            this.midShaft = longestSegment.from.translate(longestSegment.to.vectorFrom(longestSegment.from).scale(0.5))
            this.midShaftAngle = longestSegment.from.vectorFrom(longestSegment.to).angle()
          }
        } else {
          this.path.forwardToWaypoint(arcRadius, this.path.rightAngleTowardsEnd, arcRadius)
          const distance = Math.max(arcRadius + startRadius, this.path.endRelative.x + endRadius + arcRadius)
          this.path.forwardToWaypoint(distance, this.path.rightAngleTowardsEnd, arcRadius)
          this.path.forwardToWaypoint(this.path.endRelative.x + arcRadius, this.path.rightAngleTowardsEnd, arcRadius)
          this.path.forwardToWaypoint(this.path.endRelative.x, this.path.rightAngleTowardsEnd, arcRadius)

          const longestSegment = this.path.segment(2)
          this.midShaft = longestSegment.from.translate(longestSegment.to.vectorFrom(longestSegment.from).scale(0.5))
          this.midShaftAngle = longestSegment.from.vectorFrom(longestSegment.to).angle()
        }
        break
      case 90:
        if (this.path.endDirectionRelative * this.path.endRelative.y < 0) {
          this.path.forwardToWaypoint(this.path.endRelative.x - endRadius - arcRadius, this.path.rightAngleTowardsEnd, arcRadius)
          this.path.forwardToWaypoint(this.path.endRelative.x + arcRadius, this.path.rightAngleTowardsEnd, arcRadius)
        }
        this.path.forwardToWaypoint(this.path.endRelative.x, this.path.rightAngleTowardsEnd, arcRadius)
        const longestSegment = this.path.segment(0)
        this.midShaft = longestSegment.from.translate(longestSegment.to.vectorFrom(longestSegment.from).scale(0.5))
        this.midShaftAngle = longestSegment.from.vectorFrom(longestSegment.to).angle()
        break
      default:
        if (Math.abs(this.path.endRelative.y) > arcRadius * 2) {
          const distance = Math.max(arcRadius, this.path.endRelative.x + arcRadius)
          this.path.forwardToWaypoint(distance, this.path.rightAngleTowardsEnd, arcRadius)
          this.path.forwardToWaypoint(this.path.endRelative.x, this.path.rightAngleTowardsEnd, arcRadius)

          const longestSegment = this.path.segment(1)
          this.midShaft = longestSegment.from.translate(longestSegment.to.vectorFrom(longestSegment.from).scale(0.5))
          this.midShaftAngle = longestSegment.from.vectorFrom(longestSegment.to).angle()
        } else {
          this.path.forwardToWaypoint(arcRadius, this.path.rightAngleTowardsEnd, arcRadius)
          this.path.forwardToWaypoint(arcRadius + startRadius, this.path.rightAngleTowardsEnd, arcRadius)
          this.path.forwardToWaypoint(this.path.endRelative.x - arcRadius, this.path.rightAngleTowardsEnd, arcRadius)
          this.path.forwardToWaypoint(this.path.endRelative.x, this.path.rightAngleTowardsEnd, arcRadius)

          const longestSegment = this.path.segment(3)
          this.midShaft = longestSegment.from.translate(longestSegment.to.vectorFrom(longestSegment.from).scale(0.5))
          this.midShaftAngle = longestSegment.from.vectorFrom(longestSegment.to).angle()
        }
    }
  }

  distanceFrom(point) {
    return this.path.distanceFrom(point)
  }

  draw(ctx) {
    ctx.save()
    ctx.beginPath()
    this.path.draw(ctx)
    ctx.lineWidth = this.dimensions.arrowWidth
    ctx.strokeStyle = this.dimensions.arrowColor
    ctx.stroke()
    ctx.translate(...this.endShaft.xy)
    ctx.rotate(this.path.endDirection)
    ctx.translate(this.dimensions.headHeight - this.dimensions.chinHeight, 0)
    arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, true, false)
    ctx.fillStyle = this.dimensions.arrowColor
    ctx.fill()

    ctx.restore()
  }

  drawSelectionIndicator(ctx) {
    const indicatorWidth = 10
    ctx.save()
    ctx.beginPath()
    this.path.draw(ctx)
    ctx.lineWidth = this.dimensions.arrowWidth + indicatorWidth
    ctx.lineCap = 'round'
    ctx.strokeStyle = green
    ctx.stroke()
    ctx.translate(...this.endShaft.xy)
    ctx.rotate(this.path.endDirection)
    ctx.translate(this.dimensions.headHeight - this.dimensions.chinHeight, 0)
    ctx.lineWidth = indicatorWidth
    ctx.lineJoin = 'round'
    arrowHead(ctx, this.dimensions.headHeight, this.dimensions.chinHeight, this.dimensions.headWidth, false, true)
    ctx.stroke()
    ctx.restore()
  }

  midPoint() {
    return this.midShaft
  }

  shaftAngle() {
    return this.midShaftAngle
  }

  get arrowKind() {
    return 'straight'
  }
}

const computeArcRadius = (attachment) => {
  return 40 + attachment.radiusOrdinal * 10
}
