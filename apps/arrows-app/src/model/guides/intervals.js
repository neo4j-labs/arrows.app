export const coLinearIntervals = (natural, coLinear) => {
  if (coLinear.length < 2) return [];

  const intervals = [];
  const nearest = coLinear.sort(
    (a, b) => Math.abs(natural - a) - Math.abs(natural - b)
  )[0];
  const sorted = coLinear.sort((a, b) => a - b);
  const nearestIndex = sorted.indexOf(nearest);
  const polarity = Math.sign(nearest - natural);
  if (
    (nearestIndex > 0 && polarity < 0) ||
    (nearestIndex < sorted.length - 1 && polarity > 0)
  ) {
    const secondNearest = sorted[nearestIndex + polarity];
    const interval = nearest - secondNearest;
    const candidate = nearest + interval;
    intervals.push({
      candidate,
      error: Math.abs(candidate - natural),
    });
  }
  if (
    (nearestIndex > 0 && polarity > 0) ||
    (nearestIndex < sorted.length - 1 && polarity < 0)
  ) {
    const opposite = sorted[nearestIndex - polarity];
    const interval = nearest - opposite;
    const candidate = nearest - interval / 2;
    intervals.push({
      candidate,
      error: Math.abs(candidate - natural),
    });
  }
  return intervals;
};

const angularDifference = (a, b) => {
  const rawDifference = Math.abs(a - b);
  return Math.min(rawDifference, Math.PI * 2 - rawDifference);
};

export const angularIntervals = (natural, equidistant) => {
  if (equidistant.length < 2) return [];

  const intervals = [];
  const nearest = equidistant.sort(
    (a, b) => angularDifference(natural, a) - angularDifference(natural, b)
  )[0];
  const sorted = equidistant.sort((a, b) => a - b);
  const nearestIndex = sorted.indexOf(nearest);
  const polarity = Math.sign(nearest - natural);
  const wrapIndex = (index) => {
    if (index < 0) return index + sorted.length;
    if (index > sorted.length - 1) return index - sorted.length;
    return index;
  };
  const secondNearest = sorted[wrapIndex(nearestIndex + polarity)];
  const extensionInterval = nearest - secondNearest;
  const extensionCandidate = nearest + extensionInterval;
  intervals.push({
    candidate: extensionCandidate,
    error: Math.abs(extensionCandidate - natural),
  });
  const opposite = sorted[wrapIndex(nearestIndex - polarity)];
  const bisectionInterval = nearest - opposite;
  const bisectionCandidate = nearest - bisectionInterval / 2;
  intervals.push({
    candidate: bisectionCandidate,
    error: Math.abs(bisectionCandidate - natural),
  });
  return intervals;
};
