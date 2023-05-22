export interface Obstacle {
  angle: number
}

export const distribute = (preferredAngles:number[], obstacles:Obstacle[]) => {
  return preferredAngles.map(angle => {
    return {angle, separation: obstacleSeparation(angle, obstacles)}
  }).sort((a, b) => b.separation - a.separation)[0].angle;
}

export const obstacleSeparation = (angle:number, obstacles:Obstacle[]) => {
  return Math.min(...obstacles.map(obstacle => Math.min(
    Math.abs(obstacle.angle - angle),
    Math.abs(obstacle.angle - (angle - Math.PI * 2)),
    Math.abs(obstacle.angle - (angle + Math.PI * 2))
  )))
}