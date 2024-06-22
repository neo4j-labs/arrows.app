import { getStyleSelector } from '../../selectors/style';

export const calculateBoundingBox = (nodes, graph, scale = 1) => {
  if (nodes.length === 0) {
    return null;
  }

  const getPosition = (node) => node.position.scale(scale);
  const radius = (node) => getStyleSelector(node, 'radius')(graph) * scale;

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

export const getDistanceToLine = (x1, y1, x2, y2, x3, y3) => {
  let px = x2 - x1;
  let py = y2 - y1;
  let something = px * px + py * py;
  let u = ((x3 - x1) * px + (y3 - y1) * py) / something;

  if (u > 1) {
    u = 1;
  } else if (u < 0) {
    u = 0;
  }

  let x = x1 + u * px;
  let y = y1 + u * py;
  let dx = x - x3;
  let dy = y - y3;

  // # Note: If the actual distance does not matter,
  // # if you only want to compare what this function
  // # returns to other results of this function, you
  // # can just return the squared distance instead
  // # (i.e. remove the sqrt) to gain a little performance

  return Math.sqrt(dx * dx + dy * dy);
};

export const sortPoints = (points) => {
  points = points.splice(0);
  const p0 = {};

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

const angleCompare = (p0, a, b) => {
  const left = isLeft(p0, a, b);

  if (left === 0) {
    return distCompare(p0, a, b);
  }

  return left;
};

const isLeft = (p0, a, b) => {
  return (a.x - p0.x) * (b.y - p0.y) - (b.x - p0.x) * (a.y - p0.y);
};

const distCompare = (p0, a, b) => {
  const distA = (p0.x - a.x) * (p0.x - a.x) + (p0.y - a.y) * (p0.y - a.y);
  const distB = (p0.x - b.x) * (p0.x - b.x) + (p0.y - b.y) * (p0.y - b.y);
  return distA - distB;
};
