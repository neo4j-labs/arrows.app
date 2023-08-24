import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import * as d3Shape from 'd3-shape';

const POINT_PATH = 'M5 5 L5 10 L10 1';

type SvgPathDisplayProps = {
  path?: string | null;
};

const width = 1200;
const height = 400;
const viewBox = `0 0 ${width} ${height}`;

type SvgDisplayProps = {
  children: React.ReactNode;
  caption?: React.ReactNode;
};

const SvgDisplay = ({ children, caption }: SvgDisplayProps) => (
  <div style={{ width: '100%' }}>
    <svg
      width={width}
      height={height}
      style={{ display: 'block', margin: 'auto' }}
      viewBox={viewBox}
      stroke="red"
      fill="none"
    >
      <g transform={`translate(${width / 2},${height / 2})`}>{children}</g>
    </svg>
    <div style={{ width: '100%', textAlign: 'center' }}>{caption}</div>
  </div>
);

const SvgPathDisplay = ({ path }: SvgPathDisplayProps) => (
  <SvgDisplay>
    <path d={`M${width / 2},${height / 2}${path}`} />
  </SvgDisplay>
);

type Coordinates = {
  x: number;
  y: number;
};

type DotProps = {
  center: Coordinates;
};
const Dot = ({ center }: DotProps) => (
  <circle stroke="blue" cx={center.x} cy={center.y} r={4} />
);

type TriangleProps = {
  points: [Coordinates, Coordinates, Coordinates];
};

const Triangle = ({ points: [pointA, pointB, pointC] }: TriangleProps) => (
  <path
    stroke="blue"
    strokeDasharray={3}
    d={`M${pointA.x},${pointA.y} L${pointB.x},${pointB.y} L${pointC.x},${pointC.y} Z`}
  />
);

type AngleGeometry = {
  angle: number;
  hypotenuse: number;
  adjacent: number;
  opposite: number;
};

type TriangleGeometry = {
  theta: AngleGeometry;
  theta2: AngleGeometry;
  pointA: Coordinates;
  pointB: Coordinates;
  pointC: Coordinates;
};

const meta: Meta<typeof SvgPathDisplay> = {
  component: SvgPathDisplay,
};

export default meta;
type Story = StoryObj<typeof SvgPathDisplay>;

export const Line: Story = {
  args: {
    path: d3Shape.line()([
      [10, 60],
      [40, 90],
      [60, 10],
      [190, 10],
    ]),
  },
  render: ({ path }) => <SvgPathDisplay path={path} />,
};

export const Arc: Story = {
  args: {
    path: d3Shape.arc()({
      innerRadius: -10,
      outerRadius: 100,
      startAngle: 0,
      endAngle: Math.PI / 2,
    }),
  },
  render: ({ path }) => <SvgPathDisplay path={path} />,
};

export const Barbell: StoryObj<{
  circleRadius: number;
  xOffset: number;
  yOffset: number;
}> = {
  args: {
    circleRadius: 80,
    xOffset: 300,
    yOffset: 0,
  },
  render: ({ circleRadius, xOffset, yOffset }) => {
    const circleA = {
      center: { x: 0 - xOffset, y: 0 + yOffset },
    };
    const circleB = {
      center: { x: 0 + xOffset, y: 0 - yOffset },
    };
    const pointBetweenCircles = {
      x: (circleB.center.x + circleA.center.x) / 2,
      y: (circleB.center.y + circleA.center.y) / 2,
    };
    const lineAC = distanceBetween(circleA.center, pointBetweenCircles);

    const highPoint = {
      center: {
        x: pointBetweenCircles.x,
        y: pointBetweenCircles.y + circleRadius / 2,
      },
    };
    const highPointToCircleBDistance = Math.sqrt(
      Math.pow(highPoint.center.y, 2) + Math.pow(lineAC / 2, 2)
    );
    const declineAngleFromMidlineToHighPoint = Math.atan(
      highPoint.center.y / (lineAC / 2)
    );
    const triangleABC: TriangleGeometry = {
      theta: {
        angle: declineAngleFromMidlineToHighPoint,
        hypotenuse: highPointToCircleBDistance,
        adjacent: lineAC / 2,
        opposite: highPoint.center.y,
      },
      theta2: {
        angle: 180 - (declineAngleFromMidlineToHighPoint + 90),
        hypotenuse: highPointToCircleBDistance,
        adjacent: highPoint.center.y,
        opposite: lineAC / 2,
      },
      pointA: {
        x: circleB.center.x,
        y: circleB.center.y,
      },
      pointB: {
        // x: pointBetweenCircles.x,
        // y: pointBetweenCircles.y
        x: circleB.center.x - highPoint.center.y,
        y: circleB.center.y,
      },
      pointC: {
        // x: highPoint.center.x,
        // y: highPoint.center.y
        x: circleB.center.x - highPoint.center.y,
        y: circleB.center.y - lineAC / 2,
      },
    };
    const triangleABD: TriangleGeometry = {
      theta: {
        angle: declineAngleFromMidlineToHighPoint,
        hypotenuse: highPointToCircleBDistance,
        adjacent: circleRadius,
        opposite: Math.sqrt(
          Math.pow(highPointToCircleBDistance, 2) - Math.pow(circleRadius, 2)
        ),
      },
      theta2: {
        angle: 180 - (declineAngleFromMidlineToHighPoint + 90),
        hypotenuse: highPointToCircleBDistance,
        adjacent: Math.sqrt(
          Math.pow(highPointToCircleBDistance, 2) - Math.pow(circleRadius, 2)
        ),
        opposite: circleRadius,
      },
      pointA: {
        x: circleB.center.x,
        y: circleB.center.y,
      },
      pointB: {
        x: circleB.center.x - circleRadius,
        y: circleB.center.y,
      },
      pointC: {
        x: circleB.center.x - circleRadius,
        y:
          circleB.center.y -
          Math.sqrt(
            Math.pow(highPointToCircleBDistance, 2) - Math.pow(circleRadius, 2)
          ),
      },
    };
    const arc = {
      rx: circleRadius * 20,
      ry: circleRadius * 20,
      xAxisRotation: 0,
      largeArcFlag: 0,
      sweepFlag: 1,
      startX: circleA.center.x,
      startY: circleA.center.y + circleRadius,
      endX: circleB.center.x,
      endY: circleB.center.y + circleRadius,
    };

    const diagramCaption = (
      <div>
        <ul style={{ listStyle: 'none' }}>
          <li>circleRadius: {circleRadius}</li>
          <li>xOffset: {xOffset}</li>
          <li>yOffset: {yOffset}</li>
          <li>lineAC: {lineAC}</li>
        </ul>
      </div>
    );

    return (
      <SvgDisplay caption={diagramCaption}>
        <circle cx={circleA.center.x} cy={circleA.center.y} r={circleRadius} />
        <circle cx={circleB.center.x} cy={circleB.center.y} r={circleRadius} />
        <circle
          stroke="blue"
          cx={pointBetweenCircles.x}
          cy={pointBetweenCircles.y}
          r={4}
        />
        <Dot center={highPoint.center} />
        <Dot center={pointBetweenCircles} />
        <Dot center={circleA.center} />
        <Dot center={circleB.center} />
        <Triangle
          points={[triangleABC.pointA, triangleABC.pointB, triangleABC.pointC]}
        />
        <Triangle
          points={[triangleABD.pointA, triangleABD.pointB, triangleABD.pointC]}
        />
        <line
          strokeDasharray={2}
          x1={circleA.center.x}
          y1={circleA.center.y}
          x2={circleB.center.x}
          y2={circleB.center.y}
        />
        <path
          d={`M ${arc.startX} ${arc.startY}
           A ${arc.rx} ${arc.ry} ${arc.xAxisRotation} ${arc.largeArcFlag} ${arc.sweepFlag} ${arc.endX} ${arc.endY}`}
          stroke="black"
          fill="green"
          fill-opacity="0.5"
        />
      </SvgDisplay>
    );
  },
};
function distanceBetween(a: Coordinates, b: Coordinates) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
