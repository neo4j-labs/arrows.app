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

const orientations = [
  { name: 'top-left', angle: -3 * Math.PI / 4, vertical: 'top', horizontal: 'end' },
  { name: 'top', angle: -Math.PI / 2, vertical: 'top', horizontal: 'center' },
  { name: 'top-right', angle: -Math.PI / 4, vertical: 'top', horizontal: 'start' },
  { name: 'right', angle: 0, vertical: 'center', horizontal: 'start' },
  { name: 'bottom-right', angle: Math.PI / 4, vertical: 'bottom', horizontal: 'start' },
  { name: 'bottom', angle: Math.PI / 2, vertical: 'bottom', horizontal: 'center' },
  { name: 'bottom-left', angle: 3 * Math.PI / 4, vertical: 'bottom', horizontal: 'end' },
  { name: 'left', angle: Math.PI, vertical: 'center', horizontal: 'end' },
]

export const orientationFromName = (name) => {
  return orientations.find(orientation => orientation.name === name)
}