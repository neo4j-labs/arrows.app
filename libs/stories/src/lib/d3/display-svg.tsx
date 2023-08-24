import React from 'react';

import * as CSS from 'csstype';

const dashArrayForPattern = (pattern: CSS.Property.Border) => {
  switch (pattern) {
    case 'dashed':
      return '4,4';
    case 'dotted':
      return '1,4';
    case 'solid':
      return '';
    default:
      return '';
  }
};

interface DisplaySVGProps {
  width?: number;
  height?: number;

  fill?: CSS.Property.Color;
  strokeColor?: CSS.Property.Color;
  strokeWidth?: number;
  strokePattern?: CSS.Property.Border;
  children: React.ReactNode;
}

export const DisplaySVG: React.FC<DisplaySVGProps> = ({
  width = 400,
  height = 200,
  fill = 'green',
  strokeColor = 'gray',
  strokeWidth = 2,
  strokePattern = 'dotted',
  children,
}) => {
  return (
    <div style={{ width: `${width}px`, height: `${height}px` }}>
      <svg
        viewBox={`-${strokeWidth} -${strokeWidth} ${width + strokeWidth * 2} ${
          height + strokeWidth * 2
        }`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={dashArrayForPattern(strokePattern)}
        fillOpacity={0.25}
        fill={fill}
      >
        {children}
      </svg>
    </div>
  );
};
