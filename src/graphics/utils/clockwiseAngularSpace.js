export const clockwiseAngularSpace = (angles) => {
  const sorted = angles.slice(0).sort((a, b) => a - b)
  let gap = 0
  let start = undefined
  for (let i = 0; i < sorted.length; i++) {
    const previous = i === 0 ? sorted[sorted.length - 1] - 2 * Math.PI : sorted[i - 1]
    const current = sorted[i]

    if (current - previous > gap) {
      gap = current - previous
      start = previous
    }
  }
  return { gap, start }
}
