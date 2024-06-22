import { TextOrientation } from './circumferentialTextAlignment';
import { perpendicular } from './utils/angles';

export type RelationshipTextOrientation = 'parallel' | 'perpendicular';

export const readableAngle = (
  orientation: RelationshipTextOrientation,
  shaftAngle: number
) => {
  const rawAngle = angleForOrientation(orientation, shaftAngle);
  return rawAngle >= Math.PI / 2 || rawAngle <= -Math.PI / 2
    ? rawAngle + Math.PI
    : rawAngle;
};

const angleForOrientation = (
  orientation: RelationshipTextOrientation,
  shaftAngle: number
) => {
  switch (orientation) {
    case 'parallel':
      return shaftAngle;
    case 'perpendicular':
      return perpendicular(shaftAngle);
    default:
      return 0;
  }
};

export const alignmentForShaftAngle = (
  orientation: RelationshipTextOrientation,
  position: string,
  shaftAngle: number
): TextOrientation => {
  if (position === 'inline') {
    return {
      horizontal: 'center',
      vertical: 'center',
    };
  }

  const isAbove = position === 'above';
  const positiveAngle = shaftAngle < 0 ? shaftAngle + Math.PI : shaftAngle;
  const isUpward = positiveAngle < Math.PI / 2;
  const tolerance = Math.PI / 100;
  const isHorizontal =
    orientation === 'parallel' ||
    positiveAngle < tolerance ||
    positiveAngle > Math.PI - tolerance;
  const isVertical =
    orientation === 'perpendicular' ||
    Math.abs(Math.PI / 2 - positiveAngle) < tolerance;

  return {
    horizontal:
      isHorizontal && orientation !== 'perpendicular'
        ? 'center'
        : isUpward === isAbove
        ? 'start'
        : 'end',
    vertical: isVertical ? 'center' : isAbove ? 'bottom' : 'top',
  };
};
