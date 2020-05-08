export const attachmentOptions = [
{ name: 'top', angle: -Math.PI / 2 },
{ name: 'right', angle: 0 },
{ name: 'bottom', angle: Math.PI / 2 },
{ name: 'left', angle: Math.PI }
]

export const attachmentRelativePosition = (homePosition, neighbourPosition, attachmentOption) => {
  return neighbourPosition.translate(homePosition.vectorFromOrigin().invert()).rotate(-attachmentOption.angle)
}