import {
  Coordinate,
  getStyleSelector,
  Graph,
  Node,
  Point,
} from '@neo4j-arrows/model';

export const calculateBoundingBox = (
  nodes: Node[],
  graph: Graph,
  scale = 1
) => {
  if (nodes.length === 0) {
    return null;
  }

  const getPosition = (node: Node) => node.position.scale(scale);
  const radius = (node: Node) =>
    getStyleSelector(node, 'radius')(graph) * scale;

  const left = Math.min(
    ...nodes.map((node) => getPosition(node).x - radius(node))
  );
  const right = Math.max(
    ...nodes.map((node) => getPosition(node).x + radius(node))
  );
  const top = Math.min(
    ...nodes.map((node) => getPosition(node).y - radius(node))
  );
  const bottom = Math.max(
    ...nodes.map((node) => getPosition(node).y + radius(node))
  );

  return { left, right, top, bottom };
};

export const getDistanceToLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number
) => {
  const px = x2 - x1;
  const py = y2 - y1;
  const something = px * px + py * py;
  let u = ((x3 - x1) * px + (y3 - y1) * py) / something;

  if (u > 1) {
    u = 1;
  } else if (u < 0) {
    u = 0;
  }

  const x = x1 + u * px;
  const y = y1 + u * py;
  const dx = x - x3;
  const dy = y - y3;

  // # Note: If the actual distance does not matter,
  // # if you only want to compare what this function
  // # returns to other results of this function, you
  // # can just return the squared distance instead
  // # (i.e. remove the sqrt) to gain a little performance

  return Math.sqrt(dx * dx + dy * dy);
};

export const sortPoints = (points: Coordinate[]) => {
  points = points.splice(0);
  const p0: Coordinate = { x: 0, y: 0 };

  p0.y = Math.min.apply(
    null,
    points.map((p) => p.y)
  );
  p0.x = Math.max.apply(
    null,
    points.filter((p) => p.y === p0.y).map((p) => p.x)
  );
  points.sort((a, b) => angleCompare(p0, a, b));

  return points;
};

const angleCompare = (p0: Coordinate, a: Coordinate, b: Coordinate) => {
  const left = isLeft(p0, a, b);

  if (left === 0) {
    return distCompare(p0, a, b);
  }

  return left;
};

const isLeft = (p0: Coordinate, a: Coordinate, b: Coordinate) => {
  return (a.x - p0.x) * (b.y - p0.y) - (b.x - p0.x) * (a.y - p0.y);
};

const distCompare = (p0: Coordinate, a: Coordinate, b: Coordinate) => {
  const distA = (p0.x - a.x) * (p0.x - a.x) + (p0.y - a.y) * (p0.y - a.y);
  const distB = (p0.x - b.x) * (p0.x - b.x) + (p0.y - b.y) * (p0.y - b.y);
  return distA - distB;
};
