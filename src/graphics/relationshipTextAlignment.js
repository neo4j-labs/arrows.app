import {perpendicular} from "./utils/angles";
import {oppositeHorizontalAlignment, textAlignmentAtAngle} from "./circumferentialTextAlignment";

export const readableAngle = (orientation, shaftAngle) => {
  const rawAngle = angleForOrientation(orientation, shaftAngle)
  return (rawAngle > Math.PI / 2 || rawAngle < -Math.PI / 2) ? rawAngle + Math.PI : rawAngle
}

const angleForOrientation = (orientation, shaftAngle) => {
  switch (orientation) {
    case 'parallel':
      return shaftAngle
    case 'perpendicular':
      return perpendicular(shaftAngle)
    default:
      return 0
  }
}

export const alignmentForShaftAngle = (orientation, position, shaftAngle) => {
  if (position === 'inline') {
    return {
      horizontal: 'center',
      vertical: 'center'
    }
  }

  const isAbove = position === 'above'
  const positiveAngle = shaftAngle < 0 ? shaftAngle + Math.PI : shaftAngle
  const isUpward = positiveAngle < Math.PI / 2
  const tolerance = Math.PI / 100
  const isHorizontal = orientation === 'parallel' ||
    positiveAngle < tolerance || positiveAngle > Math.PI - tolerance
  const isVertical = orientation === 'perpendicular' ||
    Math.abs(Math.PI / 2 - positiveAngle) < tolerance

  return {
    horizontal: isHorizontal ? 'center' : (isUpward === isAbove) ? 'start' : 'end',
    vertical: isVertical ? 'center' : isAbove ? 'bottom' : 'top'
  }
}

const textAlignForPosition = (position, orientation, arrow) => {
  if (orientation === 'parallel' || orientation === 'perpendicular') {
    return 'center'
  }
  if (position === 'inline' && arrow.arrowKind === 'straight') {
    return 'center'
  }
  const shaftAngle = arrow.shaftAngle()
  const positiveAngle = shaftAngle < 0 ? shaftAngle + Math.PI : shaftAngle
  const tolerance = Math.PI / 100
  if (positiveAngle < tolerance || positiveAngle > Math.PI - tolerance) {
    return 'center'
  }
  if (arrow.arrowKind === 'straight') {
    const aboveAlignment = textAlignmentAtAngle(positiveAngle).horizontal
    switch (position) {
      case 'below':
        return oppositeHorizontalAlignment(aboveAlignment)
      default:
        return aboveAlignment
    }
  } else {
    return oppositeHorizontalAlignment(textAlignmentAtAngle(perpendicular(shaftAngle)).horizontal)
  }
}