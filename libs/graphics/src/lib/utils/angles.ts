export const perpendicular = (angle:number) => {
  return normaliseAngle(angle + Math.PI / 2)
}

export const normaliseAngle = (angle:number) => {
  let goodAngle = angle
  while (goodAngle < -Math.PI) goodAngle += 2 * Math.PI
  while (goodAngle > Math.PI) goodAngle -= 2 * Math.PI
  return goodAngle
}
