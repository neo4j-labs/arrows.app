import {Point} from "../model/Point";
import {idsMatch} from "../model/Id";
import {LineGuide} from "../model/guides/LineGuide";
import {CircleGuide} from "../model/guides/CircleGuide";
import {coLinearIntervals} from "../model/guides/intervals";

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

  let candidateGuides = []

  const neighbourRelationships = {};
  graph.relationships.forEach((relationship) => {
    let pair = null
    if (isNeighbour(relationship.fromId) && includeNode(relationship.toId)) {
      pair = {
        neighbour: graph.nodes.find((node) => idsMatch(node.id, relationship.fromId)),
        nonNeighbour: graph.nodes.find((node) => idsMatch(node.id, relationship.toId))
      }
    }
    if (includeNode(relationship.fromId) && isNeighbour(relationship.toId)) {
      pair = {
        neighbour: graph.nodes.find((node) => idsMatch(node.id, relationship.toId)),
        nonNeighbour: graph.nodes.find((node) => idsMatch(node.id, relationship.fromId))
      }
    }
    if (pair) {
      const pairs = neighbourRelationships[pair.neighbour.id] || []
      pairs.push(pair)
      neighbourRelationships[pair.neighbour.id] = pairs
    }

  })

  const snappingAngles = [6, 4, 3]
    .map(denominator => Math.PI / denominator)
    .flatMap(angle => [-1, -0.5, 0, 0.5].map(offset => offset * Math.PI + angle))

  for (const neighbourA of neighbours) {
    const relationshipDistances = []

    for (const relationship of neighbourRelationships[neighbourA.id] || []) {
      const relationshipVector = relationship.nonNeighbour.position.vectorFrom(relationship.neighbour.position);
      const distance = relationshipVector.distance()
      const similarDistance = relationshipDistances.includes((entry) => Math.abs(entry - distance) < 0.01);
      if (!similarDistance) {
        relationshipDistances.push(distance)
      }

      const guide = new LineGuide(neighbourA.position, relationshipVector.angle(), naturalPosition)
      if (guide.error < snapTolerance) {
        candidateGuides.push(guide)
      }
    }

    for (const distance of relationshipDistances) {
      const distanceGuide = new CircleGuide(neighbourA.position, distance, naturalPosition)
      if (distanceGuide.error < snapTolerance) {
        candidateGuides.push(distanceGuide)
      }
    }

    snappingAngles.forEach(snappingAngle => {
      const diagonalGuide = new LineGuide(neighbourA.position, snappingAngle, naturalPosition)
      const offset = naturalPosition.vectorFrom(neighbourA.position)
      if (diagonalGuide.error < snapTolerance && Math.abs(offset.angle() - snappingAngle) < angleTolerance) {
        candidateGuides.push(diagonalGuide)
      }
    })

    for (const neighbourB of neighbours) {
      if (neighbourA.id < neighbourB.id) {
        const interNeighbourVector = neighbourB.position.vectorFrom(neighbourA.position)
        const segment1 = naturalPosition.vectorFrom(neighbourA.position)
        const segment2 = neighbourB.position.vectorFrom(naturalPosition)
        const parallelGuide = new LineGuide(neighbourA.position, interNeighbourVector.angle(), naturalPosition)
        if (parallelGuide.error < snapTolerance && segment1.dot(segment2) > 0) {
          candidateGuides.push(parallelGuide)
        }

        const midPoint = neighbourA.position.translate(interNeighbourVector.scale(0.5))
        const perpendicularGuide = new LineGuide(
          midPoint,
          interNeighbourVector.rotate(Math.PI / 2).angle(),
          naturalPosition
        )

        if (perpendicularGuide.error < snapTolerance) {
          candidateGuides.push(perpendicularGuide)
        }
      }
    }
  }

  const columns = new Set()
  const rows = new Set()
  graph.nodes.forEach((node) => {
    if (includeNode(node.id)) {
      if (Math.abs(naturalPosition.x - node.position.x) < snapTolerance) {
        columns.add(node.position.x)
      }
      if (Math.abs(naturalPosition.y - node.position.y) < snapTolerance) {
        rows.add(node.position.y)
      }
    }
  })
  for (const column of columns) {
    candidateGuides.push(new LineGuide(
      new Point(column, naturalPosition.y),
      Math.PI / 2,
      naturalPosition
    ))
  }
  for (const row of rows) {
    candidateGuides.push(new LineGuide(
      new Point(naturalPosition.x, row),
      0,
      naturalPosition
    ))
  }

  const byAscendingError = (a, b) => a.error - b.error;
  candidateGuides.sort(byAscendingError)

  let guidelines = []

  while (guidelines.length === 0 && candidateGuides.length > 0) {
    const candidateGuide = candidateGuides.shift()
    guidelines.push(candidateGuide)
    snappedPosition = candidateGuide.snap(naturalPosition)
  }

  if (guidelines.length === 1 && guidelines[0].type === 'LINE') {
    const guide = guidelines[0]
    const intervals = coLinearIntervals(guide.scalar(snappedPosition),
      graph.nodes.filter((node) => includeNode(node.id) && guide.calculateError(node.position) < 0.01).map(node => guide.scalar(node.position)))
    intervals.sort(byAscendingError)
    if (intervals.length > 0) {
      const interval = intervals[0]
      const intervalGuide = new LineGuide(guide.point(interval.candidate), guide.angle + Math.PI / 2, naturalPosition)
      candidateGuides.push(intervalGuide)
      candidateGuides.sort(byAscendingError)
    }
  }

  while (guidelines.length === 1 && candidateGuides.length > 0) {
    const candidateGuide = candidateGuides.shift()
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

  return {
    snapped: guidelines.length > 0,
    guidelines,
    snappedPosition
  }
}