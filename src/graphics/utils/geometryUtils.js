import { defaultNewNodeRadius } from "../constants";
import Voronoi from "./voronoi";

export const pointOnCircle = (x, y, radius, percentage) => {
  let angle = percentage * 2 * Math.PI
  return {
    x: x + radius * Math.cos(angle),
    y: y - radius * Math.sin(angle)
  }
}

/**
 * Combined function of pointOnLine and pointOnBezier. This gives the coordinates of a point on the line at a certain percentage of the way
 * @param percentage
 * @param lineStart
 * @param lineEnd
 * @param viaNode
 * @returns {{x: number, y: number}}
 * @private
 */
export const getPointAtRange = (percentage, lineStart, lineEnd, viaNode = getMidPoint(lineStart, lineEnd)) => {
  var t = percentage
  var x = Math.pow(1 - t, 2) * lineStart.x + (2 * t * (1 - t)) * viaNode.x + Math.pow(t, 2) * lineEnd.x
  var y = Math.pow(1 - t, 2) * lineStart.y + (2 * t * (1 - t)) * viaNode.y + Math.pow(t, 2) * lineEnd.y

  return {x: x, y: y}
}

export const getMidPoint = (lineStart, lineEnd) => ({
  x : (lineStart.x + lineEnd.x) / 2,
  y : (lineStart.y + lineEnd.y) / 2
})

export const getBezierAndCircleCrossPoint = (node, start, end, isFrom, viaNode) => {
  var maxIterations = 10
  var iteration = 0
  var low = 0
  var high = 1
  var pos, angle, distanceToBorder, distanceToPoint, difference
  var threshold = 0.2

  while (low <= high && iteration < maxIterations) {
    var middle = (low + high) * 0.5

    pos = getPointAtRange(middle, start, end, viaNode)
    angle = Math.atan2((node.y - pos.y), (node.x - pos.x))
    distanceToBorder = (node.distanceToBorder && node.distanceToBorder()) || defaultNewNodeRadius
    distanceToPoint = Math.sqrt(Math.pow(pos.x - node.x, 2) + Math.pow(pos.y - node.y, 2))
    difference = distanceToBorder - distanceToPoint
    if (Math.abs(difference) < threshold) {
      break // found
    } else if (difference < 0) { // distance to nodes is larger than distance to border --> t needs to be bigger if we're looking at the to node.
      if (isFrom === false) {
        low = middle
      } else {
        high = middle
      }
    } else {
      if (isFrom === false) {
        high = middle
      } else {
        low = middle
      }
    }

    iteration++
  }
  pos.t = middle

  return pos
}

export const getCirclesCrossPoint = (node, x, y, low, high, direction, radius) => {
  let maxIterations = 10
  let iteration = 0
  let pos, angle, distanceToBorder, distanceToPoint, difference
  let threshold = 0.05
  let middle = (low + high) * 0.5

  while (low <= high && iteration < maxIterations) {
    middle = (low + high) * 0.5

    pos = pointOnCircle(x, y, radius, middle)
    angle = Math.atan2((node.y - pos.y), (node.x - pos.x))
    distanceToBorder = node.distanceToBorder()
    distanceToPoint = Math.sqrt(Math.pow(pos.x - node.x, 2) + Math.pow(pos.y - node.y, 2))
    difference = distanceToBorder - distanceToPoint
    if (Math.abs(difference) < threshold) {
      break // found
    } else if (difference > 0) { // distance to nodes is larger than distance to border --> t needs to be bigger if we're looking at the to node.
      if (direction > 0) {
        low = middle
      } else {
        high = middle
      }
    } else {
      if (direction > 0) {
        high = middle
      } else {
        low = middle
      }
    }
    iteration++
  }
  pos.t = middle

  return pos
}

export const getArrowGeometryData = (from, fromPoint, to, toPoint, viaNode, position = 'to') => {
  const pixelRatio = (window.devicePixelRatio || 1)
  const lineWidth = 1 * pixelRatio

  let angle
  let arrowPoint
  let node1 = to
  let node2 = from
  let guideOffset = -0.1
  let scaleFactor = 1
  let type = 'arrow'

  if (node1 !== node2) {
    arrowPoint = getBezierAndCircleCrossPoint(node1, from, to, position === 'from', viaNode)
    var guidePos = getPointAtRange(Math.max(0.0, Math.min(1.0, arrowPoint.t + guideOffset)), fromPoint, toPoint, viaNode)
    angle = Math.atan2(arrowPoint.y - guidePos.y, arrowPoint.x - guidePos.x)
  } else {
    /*// draw circle (loop)
    let [x, y] = this._getCircleData(ctx)
    if (position === 'from') {
      arrowPoint = this.findBorderPosition(this.from, ctx, { x, y, low: 0.25, high: 0.6, direction: -1 })
      angle = arrowPoint.t * -2 * Math.PI + 1.5 * Math.PI + 0.1 * Math.PI
    } else {
      arrowPoint = this.findBorderPosition(this.from, ctx, { x, y, low: 0.6, high: 1.0, direction: 1 })
      angle = arrowPoint.t * -2 * Math.PI + 1.5 * Math.PI - 1.1 * Math.PI
    }*/
  }

  var length = 0
  if (!(position === 'from' && type === 'none')) {
    length = 15 * scaleFactor * Math.sqrt(lineWidth)
  }

  let newPoint = {
    x: arrowPoint.x + (length + lineWidth) * 0.05 * Math.cos(angle),
    y: arrowPoint.y + (length + lineWidth) * 0.05 * Math.sin(angle)
  }

  return { point: newPoint, angle: angle, length: length, type: type }
}

export const getDistanceToLine = (x1, y1, x2, y2, x3, y3) => {
  let px = x2 - x1
  let py = y2 - y1
  let something = px * px + py * py
  let u = ((x3 - x1) * px + (y3 - y1) * py) / something

  if (u > 1) {
    u = 1
  } else if (u < 0) {
    u = 0
  }

  let x = x1 + u * px
  let y = y1 + u * py
  let dx = x - x3
  let dy = y - y3

  // # Note: If the actual distance does not matter,
  // # if you only want to compare what this function
  // # returns to other results of this function, you
  // # can just return the squared distance instead
  // # (i.e. remove the sqrt) to gain a little performance

  return Math.sqrt(dx * dx + dy * dy)
}

export const getDistanceToBezierEdge = (x1, y1, x2, y2, x3, y3, via) => { // x3,y3 is the point
  let minDistance = 1e9
  let distance
  let i, t, x, y
  let lastX = x1
  let lastY = y1
  for (i = 1; i < 10; i++) {
    t = 0.1 * i
    x = Math.pow(1 - t, 2) * x1 + (2 * t * (1 - t)) * via.x + Math.pow(t, 2) * x2
    y = Math.pow(1 - t, 2) * y1 + (2 * t * (1 - t)) * via.y + Math.pow(t, 2) * y2
    if (i > 0) {
      distance = getDistanceToLine(lastX, lastY, x, y, x3, y3)
      minDistance = distance < minDistance ? distance : minDistance
    }
    lastX = x
    lastY = y
  }

  return minDistance
}

export const isPointInPolygon = (point, vertices) => {
  const x = point.x
  const y = point.y

  let inside = false
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x
    const xj = vertices[j].x

    const yi = vertices[i].y
    const yj = vertices[j].y

    const intersect = yi > y != yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi
    if (intersect) {
      inside = !inside
    }
  }

  return inside
}

export const getVoronoi = (nodes, bbox = {xl: 0, xr: 1000, yt: 0, yb: 800}) => {
  const voronoi = new Voronoi();
  if (nodes.length > 0) {
    this.voronoi = voronoi.compute(nodes, bbox);
    return this.voronoi
  } else {
    return null
  }
}

export const sortPoints = (points) => {
  points = points.splice(0);
  const p0 = {}

  p0.y = Math.min.apply(null, points.map(p => p.y))
  p0.x = Math.max.apply(null, points.filter(p => p.y === p0.y).map(p => p.x))
  points.sort((a,b) => angleCompare(p0, a, b))

  return points
}

const angleCompare = (p0, a, b) => {
  const left = isLeft(p0, a, b)

  if (left === 0)  {
    return distCompare(p0, a, b)
  }

  return left
}

const isLeft = (p0, a, b) => {
  return (a.x - p0.x) * (b.y - p0.y) - (b.x - p0.x) * (a.y - p0.y)
}

const distCompare = (p0, a, b) => {
  var distA = (p0.x - a.x) * (p0.x - a.x) + (p0.y - a.y) * (p0.y - a.y)
  var distB = (p0.x - b.x) * (p0.x - b.x) + (p0.y - b.y) * (p0.y - b.y)
  return distA - distB
}