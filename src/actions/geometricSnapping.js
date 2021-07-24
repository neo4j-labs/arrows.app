import {Point} from "../model/Point";
import {idsMatch} from "../model/Id";
import {Vector} from "../model/Vector";

export const snapTolerance = 20
export const angleTolerance = Math.PI / 8

export const snapToNeighbourDistancesAndAngles = (graph, snappingNodeId, naturalPosition, otherSelectedNodes) => {

  const neighbours = [];
  graph.relationships.forEach((relationship) => {
    if (idsMatch(relationship.fromId, snappingNodeId)) {
      neighbours.push(graph.nodes.find((node) => idsMatch(node.id, relationship.toId)))
    } else if (idsMatch(relationship.toId, snappingNodeId)) {
      neighbours.push(graph.nodes.find((node) => idsMatch(node.id, relationship.fromId)))
    }
  })

  const includeNode = (nodeId) => !idsMatch(nodeId, snappingNodeId) && !otherSelectedNodes.includes(nodeId)

  return snapToDistancesAndAngles(graph, neighbours, includeNode, naturalPosition)
}

export const snapToDistancesAndAngles = (graph, neighbours, includeNode, naturalPosition) => {

  const isNeighbour = (nodeId) => !!neighbours.find(neighbour => neighbour.id === nodeId)

  const relationshipDistances = [];
  graph.relationships.forEach((relationship) => {
    if ((isNeighbour(relationship.fromId) && includeNode(relationship.toId)) ||
      (includeNode(relationship.fromId) && isNeighbour(relationship.toId))) {
      const distance = graph.nodes.find((node) => idsMatch(node.id, relationship.toId))
        .position.vectorFrom(graph.nodes.find((node) => idsMatch(node.id, relationship.fromId)).position)
        .distance();
      const similarDistance = relationshipDistances.find((entry) => Math.abs(entry.distance - distance) < 0.01);
      if (similarDistance) {
        similarDistance.relationships.push(relationship)
      } else {
        relationshipDistances.push({
          relationships: [relationship],
          distance
        })
      }
    }
  })

  let columns = [], rows = [], ringsAndAngles = [];

  const snappingAngles = [6, 4, 3]
    .map(denominator => Math.PI / denominator)
    .flatMap(angle => [-1, -0.5, 0, 0.5].map(offset => offset * Math.PI + angle))

  graph.nodes.forEach((node) => {
    if (includeNode(node.id)) {
      columns.push({
        x: node.position.x,
        error: Math.abs(naturalPosition.x - node.position.x)
      })
      rows.push({
        y: node.position.y,
        error: Math.abs(naturalPosition.y - node.position.y)
      })
    }
  })
  neighbours.forEach((neighbour) => {
    relationshipDistances.forEach((entry) => {
      const distance = naturalPosition.vectorFrom(neighbour.position).distance();
      ringsAndAngles.push({
        type: 'RING',
        node: neighbour,
        radius: entry.distance,
        error: Math.abs(distance - entry.distance)
      })
    })
    snappingAngles.forEach(snappingAngle => {
      const unitVector = new Vector(1, 0).rotate(snappingAngle)
      const offset = naturalPosition.vectorFrom(neighbour.position)
      const error = offset.minus(unitVector.scale(offset.dot(unitVector))).distance()
      if (error < snapTolerance && Math.abs(offset.angle() - snappingAngle) < angleTolerance) {
        ringsAndAngles.push({
          type: 'ANGLE',
          node: neighbour,
          angle: snappingAngle,
          error
        })
      }
    })
  })
  const byAscendingError = (a, b) => a.error - b.error;
  columns.sort(byAscendingError)
  rows.sort(byAscendingError)
  ringsAndAngles.sort(byAscendingError)

  let x = naturalPosition.x, y = naturalPosition.y

  const coLinearIntervals = (natural, coLinear) => {
    const intervals = []
    const nearest = coLinear.sort((a, b) => Math.abs(natural - a) - Math.abs(natural - b))[0]
    const sorted = coLinear.sort((a, b) => a - b)
    const nearestIndex = sorted.indexOf(nearest)
    const polarity = Math.sign(nearest - natural)
    if ((nearestIndex > 0 && polarity < 0) || (nearestIndex < sorted.length - 1 && polarity > 0)) {
      const secondNearest = sorted[nearestIndex + polarity]
      const interval = nearest - secondNearest
      const candidate = nearest + interval
      intervals.push({
        candidate,
        error: Math.abs(candidate - natural)
      })
    }
    if ((nearestIndex > 0 && polarity > 0) || (nearestIndex < sorted.length - 1 && polarity < 0)) {
      const opposite = sorted[nearestIndex - polarity]
      const interval = nearest - opposite
      const candidate = nearest - (interval / 2)
      intervals.push({
        candidate,
        error: Math.abs(candidate - natural)
      })
    }
    return intervals
  }

  let guidelines = []

  const vSnap = () => {
    if (columns[0] && columns[0].error < snapTolerance) {
      x = columns[0].x
      guidelines.push({type: 'VERTICAL', x})
    }
  }

  const hSnap = () => {
    if (rows[0] && rows[0].error < snapTolerance) {
      y = rows[0].y
      guidelines.push({type: 'HORIZONTAL', y})
    }
  }

  const hInterval = () => {
    if (guidelines[0] && guidelines[0].type === 'VERTICAL') {
      const intervals = coLinearIntervals(naturalPosition.y,
        graph.nodes.filter((node) => includeNode(node.id) && node.position.x === x).map(node => node.position.y))
      intervals.sort(byAscendingError)
      if (intervals.length > 0) {
        const interval  = intervals[0]
        if (interval.error < snapTolerance) {
          y = interval.candidate
          guidelines.push({type: 'HORIZONTAL', y})
        }
      }
    }
  }

  const vInterval = () => {
    if (guidelines[0] && guidelines[0].type === 'HORIZONTAL') {
      const intervals = coLinearIntervals(naturalPosition.x,
        graph.nodes.filter((node) => includeNode(node.id) && node.position.y === y).map(node => node.position.x))
      intervals.sort(byAscendingError)
      if (intervals.length > 0) {
        const interval  = intervals[0]
        if (interval.error < snapTolerance) {
          x = interval.candidate
          guidelines.push({type: 'VERTICAL', x})
        }
      }
    }
  }

  const hNeighbourInterval = () => {
    const intervals = coLinearIntervals(naturalPosition.y,
      neighbours.map(node => node.position.y))
    intervals.sort(byAscendingError)
    if (intervals.length > 0) {
      const interval = intervals[0]
      if (interval.error < snapTolerance) {
        y = interval.candidate
        guidelines.push({type: 'HORIZONTAL', y})
      }
    }
  }

  const vNeighbourInterval = () => {
    const intervals = coLinearIntervals(naturalPosition.x,
      neighbours.map(node => node.position.x))
    intervals.sort(byAscendingError)
    if (intervals.length > 0) {
      const interval = intervals[0]
      if (interval.error < snapTolerance) {
        x = interval.candidate
        guidelines.push({type: 'VERTICAL', x})
      }
    }
  }

  const guideGenerators = [vSnap, hSnap, hInterval, vInterval, hNeighbourInterval, vNeighbourInterval]
  while (guidelines.length < 2 && guideGenerators.length > 0) {
    guideGenerators.shift()()
  }

  while (guidelines.length < 2 && ringsAndAngles.length > 0 && ringsAndAngles[0].error < snapTolerance) {
    let ringOrAngle = ringsAndAngles.shift()
    let constraintPossible = true
    if (guidelines.length === 0) {
      let offset = naturalPosition.vectorFrom(ringOrAngle.node.position)
      switch (ringOrAngle.type) {
        case 'RING':
          let positionOnCircle = ringOrAngle.node.position.translate(offset.scale(ringOrAngle.radius / offset.distance()))
          x = positionOnCircle.x
          y = positionOnCircle.y
          break

        case 'ANGLE':
          const vector = new Vector(1, 0).scale(offset.distance()).rotate(ringOrAngle.angle)
          const snappedPosition = ringOrAngle.node.position.translate(vector)
          x = snappedPosition.x
          y = snappedPosition.y
          break
      }
    } else {
      let otherGuide = guidelines[0]
      let dx, dy
      switch (otherGuide.type) {
        case 'VERTICAL':
          dx = Math.abs(ringOrAngle.node.position.x - otherGuide.x)
          switch (ringOrAngle.type) {
            case 'RING':
              if (dx > ringOrAngle.radius) {
                constraintPossible = false
              } else {
                dy = Math.sqrt(ringOrAngle.radius * ringOrAngle.radius - dx * dx)
                y = ringOrAngle.node.position.y < y ? ringOrAngle.node.position.y + dy : ringOrAngle.node.position.y - dy
              }
              break

            case 'ANGLE':
              dy = dx * Math.tan(ringOrAngle.angle)
              y = ringOrAngle.node.position.y + Math.sign(dx * dy) * dy
              break
          }
          break

        case 'HORIZONTAL':
          dy = Math.abs(ringOrAngle.node.position.y - otherGuide.y)
          switch (ringOrAngle.type) {
            case 'RING':
              if (dy > ringOrAngle.radius) {
                constraintPossible = false
              } else {
                dx = Math.sqrt(ringOrAngle.radius * ringOrAngle.radius - dy * dy)
                x = ringOrAngle.node.position.x < x ? ringOrAngle.node.position.x + dx : ringOrAngle.node.position.x - dx
              }
              break

            case 'ANGLE':
              dx = dy / Math.tan(ringOrAngle.angle)
              x = ringOrAngle.node.position.x + Math.sign(dx * dy) * dx
              break
          }
          break

        case 'CIRCLE':
          let betweenCenters = ringOrAngle.node.position.vectorFrom(otherGuide.center)
          let d = betweenCenters.distance()
          if (d > Math.abs(ringOrAngle.radius - otherGuide.radius) && d < ringOrAngle.radius + otherGuide.radius) {
            let a = (otherGuide.radius * otherGuide.radius - ringOrAngle.radius * ringOrAngle.radius + d * d) / (2 * d)
            let midPoint = otherGuide.center.translate(betweenCenters.scale(a / d))
            let h = Math.sqrt(otherGuide.radius * otherGuide.radius - a * a)
            let bisector = betweenCenters.perpendicular().scale(h / d)
            let intersections = [midPoint.translate(bisector), midPoint.translate(bisector.invert())]
            let errors = intersections.map((point) => point.vectorFrom(naturalPosition).distance())
            let intersection = errors[0] < errors[1] ? intersections[0] : intersections[1]
            x = intersection.x
            y = intersection.y
          } else {
            constraintPossible = false
          }
      }
    }
    if (constraintPossible) {
      switch (ringOrAngle.type) {
        case 'RING':
          guidelines.push({type: 'CIRCLE', center: ringOrAngle.node.position, radius: ringOrAngle.radius})
          break

        case 'ANGLE':
          guidelines.push({type: 'ANGLE', center: ringOrAngle.node.position, angle: ringOrAngle.angle})
          break
      }
    }
  }

  return {
    snapped: guidelines.length > 0,
    guidelines: guidelines,
    snappedPosition: new Point(x, y)
  }
}