import { Point } from '../model/Point';
import { idsMatch } from '../model/Id';
import { LineGuide } from '../model/guides/LineGuide';
import { CircleGuide } from '../model/guides/CircleGuide';
import { areParallel } from '../model/guides/intersections';
import { byAscendingError } from '../model/guides/guides';

export const snapTolerance = 20;
const grossTolerance = snapTolerance * 2;
export const angleTolerance = Math.PI / 4;

export const snapToNeighbourDistancesAndAngles = (
  graph,
  snappingNodeId,
  naturalPosition,
  otherSelectedNodes
) => {
  const neighbours = [];
  graph.relationships.forEach((relationship) => {
    if (
      idsMatch(relationship.fromId, snappingNodeId) &&
      !otherSelectedNodes.includes(relationship.toId)
    ) {
      neighbours.push(
        graph.nodes.find((node) => idsMatch(node.id, relationship.toId))
      );
    } else if (
      idsMatch(relationship.toId, snappingNodeId) &&
      !otherSelectedNodes.includes(relationship.fromId)
    ) {
      neighbours.push(
        graph.nodes.find((node) => idsMatch(node.id, relationship.fromId))
      );
    }
  });

  const includeNode = (nodeId) =>
    !idsMatch(nodeId, snappingNodeId) && !otherSelectedNodes.includes(nodeId);

  return snapToDistancesAndAngles(
    graph,
    neighbours,
    includeNode,
    naturalPosition
  );
};

export const snapToDistancesAndAngles = (
  graph,
  neighbours,
  includeNode,
  naturalPosition
) => {
  const isNeighbour = (nodeId) =>
    !!neighbours.find((neighbour) => neighbour.id === nodeId);
  let snappedPosition = naturalPosition;

  let possibleGuides = [];

  const neighbourRelationships = {};
  const collectRelationship = (neighbourNodeId, nonNeighbourNodeId) => {
    const pair = {
      neighbour: graph.nodes.find((node) => idsMatch(node.id, neighbourNodeId)),
      nonNeighbour: graph.nodes.find((node) =>
        idsMatch(node.id, nonNeighbourNodeId)
      ),
    };
    const pairs = neighbourRelationships[pair.neighbour.id] || [];
    pairs.push(pair);
    neighbourRelationships[pair.neighbour.id] = pairs;
  };

  graph.relationships.forEach((relationship) => {
    if (isNeighbour(relationship.fromId) && includeNode(relationship.toId)) {
      collectRelationship(relationship.fromId, relationship.toId);
    }
    if (includeNode(relationship.fromId) && isNeighbour(relationship.toId)) {
      collectRelationship(relationship.toId, relationship.fromId);
    }
  });

  const snappingAngles = [6, 4, 3]
    .map((denominator) => Math.PI / denominator)
    .flatMap((angle) =>
      [-1, -0.5, 0, 0.5].map((offset) => offset * Math.PI + angle)
    );

  for (const neighbourA of neighbours) {
    const relationshipDistances = [];

    for (const relationship of neighbourRelationships[neighbourA.id] || []) {
      const relationshipVector = relationship.nonNeighbour.position.vectorFrom(
        relationship.neighbour.position
      );
      const distance = relationshipVector.distance();
      const similarDistance = relationshipDistances.includes(
        (entry) => Math.abs(entry - distance) < 0.01
      );
      if (!similarDistance) {
        relationshipDistances.push(distance);
      }

      const guide = new LineGuide(
        neighbourA.position,
        relationshipVector.angle(),
        naturalPosition
      );
      if (guide.error < grossTolerance) {
        possibleGuides.push(guide);
      }
    }

    for (const distance of relationshipDistances) {
      const distanceGuide = new CircleGuide(
        neighbourA.position,
        distance,
        naturalPosition
      );
      if (distanceGuide.error < grossTolerance) {
        possibleGuides.push(distanceGuide);
      }
    }

    snappingAngles.forEach((snappingAngle) => {
      const diagonalGuide = new LineGuide(
        neighbourA.position,
        snappingAngle,
        naturalPosition
      );
      const offset = naturalPosition.vectorFrom(neighbourA.position);
      if (
        diagonalGuide.error < grossTolerance &&
        Math.abs(offset.angle() - snappingAngle) < angleTolerance
      ) {
        possibleGuides.push(diagonalGuide);
      }
    });

    for (const neighbourB of neighbours) {
      if (neighbourA.id < neighbourB.id) {
        const interNeighbourVector = neighbourB.position.vectorFrom(
          neighbourA.position
        );
        const segment1 = naturalPosition.vectorFrom(neighbourA.position);
        const segment2 = neighbourB.position.vectorFrom(naturalPosition);
        const parallelGuide = new LineGuide(
          neighbourA.position,
          interNeighbourVector.angle(),
          naturalPosition
        );
        if (
          parallelGuide.error < grossTolerance &&
          segment1.dot(segment2) > 0
        ) {
          possibleGuides.push(parallelGuide);
        }

        const midPoint = neighbourA.position.translate(
          interNeighbourVector.scale(0.5)
        );
        const perpendicularGuide = new LineGuide(
          midPoint,
          interNeighbourVector.rotate(Math.PI / 2).angle(),
          naturalPosition
        );

        if (perpendicularGuide.error < grossTolerance) {
          possibleGuides.push(perpendicularGuide);
        }
      }
    }
  }

  const columns = new Set();
  const rows = new Set();
  graph.nodes.forEach((node) => {
    if (includeNode(node.id)) {
      if (Math.abs(naturalPosition.x - node.position.x) < grossTolerance) {
        columns.add(node.position.x);
      }
      if (Math.abs(naturalPosition.y - node.position.y) < grossTolerance) {
        rows.add(node.position.y);
      }
    }
  });
  for (const column of columns) {
    possibleGuides.push(
      new LineGuide(
        new Point(column, naturalPosition.y),
        Math.PI / 2,
        naturalPosition
      )
    );
  }
  for (const row of rows) {
    possibleGuides.push(
      new LineGuide(new Point(naturalPosition.x, row), 0, naturalPosition)
    );
  }

  const includedNodes = graph.nodes.filter((node) => includeNode(node.id));
  const intervalGuides = [];
  for (const guide of possibleGuides) {
    const intervalGuide = guide.intervalGuide(includedNodes, naturalPosition);
    if (intervalGuide && intervalGuide.error < grossTolerance) {
      intervalGuides.push(intervalGuide);
    }
  }
  possibleGuides.push(...intervalGuides);

  const candidateGuides = [...possibleGuides];
  candidateGuides.sort(byAscendingError);

  const guidelines = [];

  while (guidelines.length === 0 && candidateGuides.length > 0) {
    const candidateGuide = candidateGuides.shift();
    if (candidateGuide.error < snapTolerance) {
      guidelines.push(candidateGuide);
      snappedPosition = candidateGuide.snap(naturalPosition);
    }
  }

  while (guidelines.length === 1 && candidateGuides.length > 0) {
    const candidateGuide = candidateGuides.shift();
    const combination = guidelines[0].combine(candidateGuide, naturalPosition);
    if (combination.possible) {
      const error = combination.intersection
        .vectorFrom(naturalPosition)
        .distance();
      if (error < snapTolerance) {
        guidelines.push(candidateGuide);
        snappedPosition = combination.intersection;
      }
    }
  }

  const lineGuides = guidelines.filter((guide) => guide.type === 'LINE');
  for (const candidateGuide of possibleGuides) {
    if (
      !guidelines.includes(candidateGuide) &&
      candidateGuide.calculateError(snappedPosition) < 0.01
    ) {
      if (candidateGuide.type === 'LINE') {
        if (lineGuides.every((guide) => !areParallel(guide, candidateGuide))) {
          lineGuides.push(candidateGuide);
          guidelines.push(candidateGuide);
        }
      } else {
        guidelines.push(candidateGuide);
      }
    }
  }

  return {
    snapped: guidelines.length > 0,
    guidelines,
    snappedPosition,
  };
};
