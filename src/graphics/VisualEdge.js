import get from 'lodash.get'
import {
  getArrowGeometryData, getBezierAndCircleCrossPoint, getCirclesCrossPoint,
  getPointAtRange
} from "./geometryUtils";
import { drawArrowEndpoint } from "./canvasRenderer";
import {idsMatch} from "../model/Id";

export default class VisualEdge {
  constructor(edgeData, options) {
    this.relationship = edgeData.relationship
    this.id = this.relationship.id
    this.from = edgeData.from
    this.to = edgeData.to
    this.options = options

    if (this.relationship.fromId === this.relationship.toId) {
      this.from.addEdge(this, DIRECTION.LOOP)
    } else {
      this.from.addEdge(this, DIRECTION.OUT)
      this.to.addEdge(this, DIRECTION.IN)
    }

    this.edgeBundle = null
  }

  get deflection () {
    return this.edgeBundle && this.edgeBundle.getDeflectionMultiplier(this.id)
  }

  updateEndPoints () {
    this._updateEndPointsWithGap(this.getViaCoordinates())
  }

  draw (ctx) {
    if (this._getOption('hidden')) {
      return
    }

    // get the via node from the edge type
    this.viaCoordinates = this.getViaCoordinates()

    const dataTo = getArrowGeometryData(this.from, this.fromPoint, this.to, this.toPoint, this.viaCoordinates)

    // Move back end point sligthly so line doesnt stick out of arrow head
    const pixelRatio = (window.devicePixelRatio || 1)
    const lineWidth = this._getOption('width') * pixelRatio

    this.toPoint.x -= Math.cos(dataTo.angle) * lineWidth
    this.toPoint.y -= Math.sin(dataTo.angle) * lineWidth

    // draw arrow
    this.drawLine(ctx, this.viaCoordinates, false, false)
    this.drawArrowHead(ctx, dataTo)

    // draw label
    if (this._getOption('drawLabel')) {
      this.drawLabel(ctx)
    }
  }

  drawLine (ctx, viaNode, outline, blur) {
    const selected = this._getOption('selected')

    if (outline) {
      ctx.strokeStyle = this._getOption('edgeTypePlugin.color.outlineSelected')
      ctx.lineWidth = 3 * this._getOption('edgeTypePlugin.outlineWidth')
    } else {
      ctx.strokeStyle = this._getOption('color.fill')
      ctx.lineWidth = selected ? 1.5 : 1
    }

    const pixelRatio = (window.devicePixelRatio || 1)
    ctx.lineWidth *= pixelRatio

    if (this.from !== this.to) {
      // draw line
      this._line(ctx, viaNode, blur)
    } else {
      let [x, y, radius] = this._getCircleData(ctx)
      this._circle(ctx, x, y, radius, blur)
    }
  }

  drawArrowHead (ctx, arrowData) {
    let length = arrowData.length
    drawArrowEndpoint(ctx, this.toPoint.x, this.toPoint.y, arrowData.angle, length, 0.5)

    ctx.fill()
  }

  _line (ctx, viaNode, blur) {
    // draw a straight line
    ctx.beginPath()
    ctx.moveTo(this.fromPoint.x, this.fromPoint.y)

    // fallback to normal straight edges
    if (viaNode.x === undefined) {
      ctx.lineTo(this.toPoint.x, this.toPoint.y)
    } else {
      ctx.quadraticCurveTo(viaNode.x, viaNode.y, this.toPoint.x, this.toPoint.y)
    }
    // draw shadow if enabled
    if (blur) {
      this.enableShadow(ctx)
    }
    ctx.stroke()
    if (blur) {
      this.disableShadow(ctx)
    }
  }

  _circle (ctx, x, y, radius, blur) {
    // draw shadow if enabled
    if (blur) {
      this.enableShadow(ctx)
    }

    ctx.beginPath()

    ctx.moveTo(this.fromPoint.x, this.fromPoint.y)
    // Draw two arcs from the circle to the via point
    ctx.quadraticCurveTo(this.fromVia.x, this.fromVia.y, this.viaNode.x, this.viaNode.y)
    // and to the other hook on the circle
    ctx.quadraticCurveTo(this.toVia.x, this.toVia.y, this.toPoint.x, this.toPoint.y)

    ctx.stroke()

    // disable shadows for other elements.
    if (blur) {
      this.disableShadow(ctx)
    }
  }

  _getCircleData (ctx) {
    let x, y
    const node = this.from
    const pixelRatio = (window.devicePixelRatio || 1)
    const radius = this._getOption('selfReferenceSize') * pixelRatio

    if (node.width === undefined) {
      node.resize(ctx)
    }

    // get circle coordinates
    if (node.width > node.height) {
      x = node.x + node.width * 0.5
      y = node.y - radius
    } else {
      x = node.x + radius
      y = node.y - node.height * 0.5
    }
    return [x, y, radius]
  }

  _getOption (path) {
    return get(this.options, path)
  }

  getViaCoordinates () {
    if (this.from === undefined || this.to === undefined) {
      return
    }

    const pixelRatio = (window.devicePixelRatio || 1)
    const fromArrowGap = this._getOption('edgeTypePlugin.arrows.from.gap') * pixelRatio
    const toArrowGap = this._getOption('edgeTypePlugin.arrows.to.gap') * pixelRatio
    const bundleSpacing = this._getOption('edgeTypePlugin.bundleSpacing') * pixelRatio

    let xVia
    let yVia
    /* For the edges between different nodes that are to be drawn as "neo" */

    /* First assume a center position just between the centers of the two nodes */
    xVia = (this.from.x + this.to.x) / 2
    yVia = (this.from.y + this.to.y) / 2

    /*
     * Then calculating the potential difference in radii between them
     * this can be affected for example by the label crust and selected rng
     * as well as a gap between the node and the arrow on it's side
     */
    var radiusDifference = this.to.radius - this.from.radius
    if (toArrowGap) {
      radiusDifference += toArrowGap
    }
    if (fromArrowGap) {
      radiusDifference -= fromArrowGap
    }

    /* Get the vector between the nodes, and divide it by it's length to normalise it */
    let xVector = this.from.x - this.to.x
    let yVector = this.from.y - this.to.y
    let vectorLength = Math.sqrt(xVector * xVector + yVector * yVector)
    let xVectorNormalized = xVector / vectorLength
    let yVectorNormalized = yVector / vectorLength

    // Adjust the centerpoint slightly to adjust for the difference in radius
    xVia += radiusDifference / 2 * xVectorNormalized
    yVia += radiusDifference / 2 * yVectorNormalized

    // Us the inverted vectors times the spacing for the edge to move the center point along the normal vector
    var spacing = bundleSpacing * this.deflection
    xVia -= spacing * yVectorNormalized
    yVia += spacing * xVectorNormalized

    return {x: xVia, y: yVia}
  }

  _updateEndPointsWithGap (viaNode) {
    if (!this.from || !this.to || this.from === this.to) {
      return
    }

    const pixelRatio = (window.devicePixelRatio || 1)
    const width = this._getOption('width') * pixelRatio
    const fromArrowGap = this._getOption('edgeTypePlugin.arrows.from.gap') * pixelRatio
    const toArrowGap = this._getOption('edgeTypePlugin.arrows.to.gap') * pixelRatio

    // For the From Node
    let deltaFromVia = {
      x: this.from.x - viaNode.x,
      y: this.from.y - viaNode.y
    }
    let distanceFromVia = Math.sqrt(deltaFromVia.x * deltaFromVia.x + deltaFromVia.y * deltaFromVia.y)
    let ratioFromBorder = this.from.radius / distanceFromVia

    if (fromArrowGap) {
      ratioFromBorder += (fromArrowGap + width * 1.5) / distanceFromVia
    }

    this.fromPoint = {
      x: this.from.x - ratioFromBorder * deltaFromVia.x,
      y: this.from.y - ratioFromBorder * deltaFromVia.y
    }

    // For the To Node
    let deltaToVia = {
      x: this.to.x - viaNode.x,
      y: this.to.y - viaNode.y
    }
    let distanceToVia = Math.sqrt(deltaToVia.x * deltaToVia.x + deltaToVia.y * deltaToVia.y)
    let ratioToBorder = this.to.radius / distanceToVia

    if (toArrowGap) {
      ratioToBorder += (toArrowGap + width * 1.5) / distanceFromVia
    }

    this.toPoint = {
      x: this.to.x - ratioToBorder * deltaToVia.x,
      y: this.to.y - ratioToBorder * deltaToVia.y
    }
  }

  findBorderPosition (nearNode, options) {
    if (this.from !== this.to) {
      return this._findBorderPositionBezier(nearNode)
    } else {
      return this._findBorderPositionCircle(nearNode, options)
    }
  }

  /**
   * This function uses binary search to look for the point where the bezier curve crosses the border of the node.
   *
   * @param nearNode
   * @param ctx
   * @param viaNode
   * @param nearNode
   * @param ctx
   * @param viaNode
   * @param nearNode
   * @param ctx
   * @param viaNode
   */
  _findBorderPositionBezier (nearNode, ctx, viaNode = this.getViaCoordinates()) {
    var node = this.to
    var isFrom = false
    if (idsMatch(nearNode.id, this.from.id)) {
      node = this.from
      isFrom = true
    }

    return getBezierAndCircleCrossPoint(node, this.fromPoint, this.toPoint, isFrom, viaNode)
  }

  /**
   * This function uses binary search to look for the point where the circle crosses the border of the node.
   * @param node
   * @param ctx
   * @param options
   * @returns {*}
   * @private
   */
  _findBorderPositionCircle (node, ctx, options) {
    let x = options.x
    let y = options.y
    let low = options.low
    let high = options.high
    let direction = options.direction
    let radius = this.options.selfReferenceSize

    return getCirclesCrossPoint(node, x, y, low, high, direction, radius)
  }

  _rotateForLabelAlignment (ctx) {
    var dy = this.from.y - this.to.y
    var dx = this.from.x - this.to.x
    var angle = Math.atan2(dy, dx)

    // rotate so label it is readable
    if ((angle < -1 && dx < 0) || (angle > 0 && dx < 0)) {
      angle = angle + Math.PI
    }

    ctx.rotate(angle)
  }

  drawLabel (ctx) {
    const viaNode = this.labelPosition || this.getViaCoordinates()

    const pixelRatio = (window.devicePixelRatio || 1)
    const label = this.relationship.type
    const fontColor = this._getOption('font.color')
    const fontSize = this._getOption('font.size') * pixelRatio
    const fontFace = this._getOption('font.face')
    const radius = this._getOption('selfReferenceSize') * pixelRatio
    const selected = this._getOption('selected')
    const fontWeight = selected ? 'bold ' : 'normal '

    if (label !== undefined) {
      // set style
      var node1 = this.from
      var node2 = this.to

      if (node1 !== node2) {
        const point = getPointAtRange(0.5, this.from, this.to, viaNode)
        ctx.save()

        ctx.fillStyle = fontColor
        ctx.font = fontWeight + fontSize + 'px ' + fontFace
        let width = ctx.measureText(label).width
        let height = fontSize

        ctx.translate(point.x, point.y)
        this._rotateForLabelAlignment(ctx)
        ctx.fillText(label, -width / 2, -height / 2)

        ctx.restore()
      } else {
        // If the self referring edge has some mode dedicated calculations already done on where to place the
        // label - stored in labelPosition use that instead
        if (this.labelPosition) {
          // The calculations here are more empirical than scientific
          // We use a similar pattern that or normal edges but need to adjust this for labels that are upsaide down to make them below
          // instead of above the end of the loop. It would be much nicer if we could have override the valign and set it to top and bottom
          // respectively but that is probably to late in the game.

          const point = this.labelPosition
          ctx.save()

          let width = ctx.measureText(label).width * pixelRatio
          let height = fontSize

          ctx.translate(point.x, point.y)
          ctx.rotate(this.labelAngle)

          // TODO: try to use valign instead of this offset

          // For the labels that are to be drawn "under" the loop we need to do an
          // adjustment, the line margin is not as magic as it seems - it's the same
          // constant that is used in the label module to do the calculations of the lines
          if (point.adjustment === -1) {
            let lineMargin = 2
            // Though why we use the 75% of the height here I don't know.
            // This is based on empiraclly trying with different font sizes
            // TODO: calculations that are more intuitive
            ctx.translate(0, height * 0.75 + lineMargin * 2)
          }

          // draw the label - because we have done a translate above the x and y parameters are not used
          ctx.fillStyle = fontColor
          ctx.font = fontWeight + fontSize + 'px ' + fontFace
          ctx.fillText(label, -width / 4, -height / 4)
          ctx.restore()
        } else {
          // Ignore the orientations.
          var x, y
          if (node1.width > node1.height) {
            x = node1.x + node1.width * 0.5
            y = node1.y - radius
          } else {
            x = node1.x + radius
            y = node1.y - node1.height * 0.5
          }
          const point = this._pointOnCircle(x, y, radius, 0.125)
          ctx.fillStyle = fontColor
          ctx.font = fontWeight + fontSize + 'px ' + fontFace
          ctx.fillText(label, point.x, point.y)
        }
      }
    }
  }
}

export const DIRECTION = {
  IN: 'IN',
  OUT: 'OUT',
  LOOP: 'LOOP'
}
