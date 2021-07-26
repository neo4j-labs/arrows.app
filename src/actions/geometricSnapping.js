import {Point} from "../model/Point";
import {idsMatch} from "../model/Id";
import {Vector} from "../model/Vector";
import {LineGuide} from "./guides/LineGuide";
import {CircleGuide} from "./guides/CircleGuide";

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
  let snappedPosition = naturalPosition

  let columns = [], rows = [], circles = [], diagonals = [];

  const relationshipDistances = [];
  graph.relationships.forEach((relationship) => {
    if ((isNeighbour(relationship.fromId) && includeNode(relationship.toId)) ||
      (includeNode(relationship.fromId) && isNeighbour(relationship.toId))) {
      const startNode = graph.nodes.find((node) => idsMatch(node.id, relationship.toId));
      const endNode = graph.nodes.find((node) => idsMatch(node.id, relationship.fromId));
      const relationshipVector = startNode.position.vectorFrom(endNode.position);
      const distance = relationshipVector.distance();
      const similarDistance = relationshipDistances.find((entry) => Math.abs(entry.distance - distance) < 0.01);
      if (similarDistance) {
        similarDistance.relationships.push(relationship)
      } else {
        relationshipDistances.push({
          relationships: [relationship],
          distance
        })
      }
      const unitVector = relationshipVector.scale(1 / distance)
      const offset = naturalPosition.vectorFrom(endNode.position)
      const error = offset.minus(unitVector.scale(offset.dot(unitVector))).distance()
      if (error < snapTolerance) {
        diagonals.push({
          center: endNode.position,
          angle: relationshipVector.angle(),
          error
        })
      }
    }
  })

  for (const neighbourA of neighbours) {
    for (const neighbourB of neighbours) {
      if (neighbourA.id < neighbourB.id) {
        const interNeighbourVector = neighbourB.position.vectorFrom(neighbourA.position)
        const unitVector = interNeighbourVector.scale(1 / interNeighbourVector.distance())
        const offset = naturalPosition.vectorFrom(neighbourA.position)
        const error = offset.minus(unitVector.scale(offset.dot(unitVector))).distance()
        const segment1 = naturalPosition.vectorFrom(neighbourA.position)
        const segment2 = neighbourB.position.vectorFrom(naturalPosition)
        if (error < snapTolerance && segment1.dot(segment2) > 0) {
          diagonals.push({
            center: neighbourA.position,
            angle: interNeighbourVector.angle(),
            error
          })
        }
      }
    }
  }

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
      circles.push({
        center: neighbour.position,
        radius: entry.distance,
        error: Math.abs(distance - entry.distance)
      })
    })
    snappingAngles.forEach(snappingAngle => {
      const unitVector = new Vector(1, 0).rotate(snappingAngle)
      const offset = naturalPosition.vectorFrom(neighbour.position)
      const error = offset.minus(unitVector.scale(offset.dot(unitVector))).distance()
      if (error < snapTolerance && Math.abs(offset.angle() - snappingAngle) < angleTolerance) {
        diagonals.push({
          center: neighbour.position,
          angle: snappingAngle,
          error
        })
      }
    })
  })
  const byAscendingError = (a, b) => a.error - b.error;
  columns.sort(byAscendingError)
  rows.sort(byAscendingError)
  circles.sort(byAscendingError)
  diagonals.sort(byAscendingError)

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
      return new LineGuide(new Point(x, 0), Math.PI / 2)
    }
    return null
  }

  const hSnap = () => {
    if (rows[0] && rows[0].error < snapTolerance) {
      y = rows[0].y
      return new LineGuide(new Point(0, y), 0)
    }
    return null
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
          return new LineGuide(new Point(0, y), 0)
        }
      }
    }
    return null
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
          return new LineGuide(new Point(x, 0), Math.PI / 2)
        }
      }
    }
    return null
  }

  const hNeighbourInterval = () => {
    const intervals = coLinearIntervals(naturalPosition.y,
      neighbours.map(node => node.position.y))
    intervals.sort(byAscendingError)
    if (intervals.length > 0) {
      const interval = intervals[0]
      if (interval.error < snapTolerance) {
        y = interval.candidate
        return new LineGuide(new Point(0, y), 0)
      }
    }
    return null
  }

  const vNeighbourInterval = () => {
    const intervals = coLinearIntervals(naturalPosition.x,
      neighbours.map(node => node.position.x))
    intervals.sort(byAscendingError)
    if (intervals.length > 0) {
      const interval = intervals[0]
      if (interval.error < snapTolerance) {
        x = interval.candidate
        return new LineGuide(new Point(x, 0), Math.PI / 2)
      }
    }
    return null
  }

  const radiusSnap = () => {
    if (circles.length > 0) {
      const circle = circles.shift()
      if (circle.error < snapTolerance) {
        return new CircleGuide(circle.center, circle.radius)
      }
    }
    return null
  }

  const angleSnap = () => {
    if (diagonals.length > 0) {
      const diagonal = diagonals.shift()
      if (diagonal.error < snapTolerance) {
        return new LineGuide(diagonal.center, diagonal.angle)
      }
    }
    return null
  }

  const guideGenerators = [vSnap, hSnap, hInterval, radiusSnap, angleSnap, vInterval, hNeighbourInterval, vNeighbourInterval]
  while (guidelines.length === 0 && guideGenerators.length > 0) {
    const candidateGuide = guideGenerators.shift()()
    if (candidateGuide !== null) {
      guidelines.push(candidateGuide)
      snappedPosition = candidateGuide.snap(naturalPosition)
    }
  }

  if (guidelines.length === 1) {
    while (guidelines.length === 1 && guideGenerators.length > 0) {
      const candidateGuide = guideGenerators.shift()()
      if (candidateGuide !== null) {
        const combination = guidelines[0].combine(candidateGuide, naturalPosition)
        if (combination.possible) {
          const error = combination.intersection.vectorFrom(naturalPosition).distance()
          if (error < snapTolerance) {
            guidelines.push(candidateGuide)
            snappedPosition = combination.intersection
          }
        }
      }
    }
  }

  return {
    snapped: guidelines.length > 0,
    guidelines,
    snappedPosition
  }
}