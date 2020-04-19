export const distribute = (items, obstacles) => {
  const result = []
  const currentObstacles = [...obstacles]
  items.forEach(item => {
    const itemAngle = item.preferredAngles.map(angle => {
      return {angle, separation: obstacleSeparation(angle, currentObstacles)}
    }).sort((a, b) => b.separation - a.separation)[0].angle;
    result.push({
      angle: itemAngle,
      payload: item.payload
    })
    currentObstacles.push({angle: itemAngle})
  })
  return result
}

export const obstacleSeparation = (angle, obstacles) => {
  return Math.min(...obstacles.map(obstacle => Math.min(
    Math.abs(obstacle.angle - angle),
    Math.abs(obstacle.angle - (angle - Math.PI * 2)),
    Math.abs(obstacle.angle - (angle + Math.PI * 2))
  )))
}