import {Point} from "../model/Point";
import {idsMatch} from "../model/Id";

export const snapTolerance = 20

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

  let columns = [], rows = [], rings = [];

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
      rings.push({
        node: neighbour,
        radius: entry.distance,
        error: Math.abs(distance - entry.distance)
      })
    })
  })
  const byAscendingError = (a, b) => a.error - b.error;
  columns.sort(byAscendingError)
  rows.sort(byAscendingError)
  rings.sort(byAscendingError)

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

  while (guidelines.length < 2 && rings.length > 0 && rings[0].error < snapTolerance) {
    let ring = rings.shift()
    let constraintPossible = true
    if (guidelines.length === 0) {
      let offset = naturalPosition.vectorFrom(ring.node.position)
      let positionOnCircle = ring.node.position.translate(offset.scale(ring.radius / offset.distance()))
      x = positionOnCircle.x
      y = positionOnCircle.y
    } else {
      let otherGuide = guidelines[0]
      let dx, dy
      switch (otherGuide.type) {
        case 'VERTICAL':
          dx = Math.abs(ring.node.position.x - otherGuide.x)
          if (dx > ring.radius) {
            constraintPossible = false
          } else {
            dy = Math.sqrt(ring.radius * ring.radius - dx * dx)
            y = ring.node.position.y < y ? ring.node.position.y + dy : ring.node.position.y - dy
          }
          break

        case 'HORIZONTAL':
          dy = Math.abs(ring.node.position.y - otherGuide.y)
          if (dy > ring.radius) {
            constraintPossible = false
          } else {
            dx = Math.sqrt(ring.radius * ring.radius - dy * dy)
            x = ring.node.position.x < x ? ring.node.position.x + dx : ring.node.position.x - dx
          }
          break

        case 'CIRCLE':
          let betweenCenters = ring.node.position.vectorFrom(otherGuide.center)
          let d = betweenCenters.distance()
          if (d > Math.abs(ring.radius - otherGuide.radius) && d < ring.radius + otherGuide.radius) {
            let a = (otherGuide.radius * otherGuide.radius - ring.radius * ring.radius + d * d) / (2 * d)
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
    if (constraintPossible) guidelines.push({type: 'CIRCLE', center: ring.node.position, radius: ring.radius})
  }

  return {
    snapped: guidelines.length > 0,
    guidelines: guidelines,
    snappedPosition: new Point(x, y)
  }
}