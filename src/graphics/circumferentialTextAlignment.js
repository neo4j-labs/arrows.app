export const textAlignmentAtAngle = (angle) => {
  if (0 <= angle && angle <= Math.PI / 2) {
    return {vertical: 'top', horizontal: 'left'}
  } else if (Math.PI / 2 < angle && angle <= Math.PI) {
    return {vertical: 'top', horizontal: 'right'}
  } else if (-Math.PI <= angle && angle < -Math.PI / 2) {
    return {vertical: 'bottom', horizontal: 'right'}
  } else if (-Math.PI / 2 <= angle && angle < 0) {
    return {vertical: 'bottom', horizontal: 'left'}
  } else {
    throw new Error(`Angle ${angle} outside allowed bounds of [-PI, PI]`)
  }
}