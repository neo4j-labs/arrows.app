export const coLinearIntervals = (natural, coLinear) => {
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
