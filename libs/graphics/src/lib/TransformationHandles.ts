import {
  Coordinate,
  EntitySelection,
  Point,
  ViewTransformation,
} from '@neo4j-arrows/model';
import { drawSolidRectangle } from './canvasRenderer';
import { Vector } from '@neo4j-arrows/model';
import { selectionHandle } from '@neo4j-arrows/model';
import { selectedNodeIds } from '@neo4j-arrows/model';
import { combineBoundingBoxes } from './utils/BoundingBox';
import { adaptForBackground } from './backgroundColorAdaption';
import { VisualGraph } from './VisualGraph';
import { CanvasAdaptor } from './utils/CanvasAdaptor';
import { DrawingContext } from './utils/DrawingContext';

export const handleSize = 20;
const handlePadding = 2;

const choose = (mode: string, min: number, max: number) => {
  switch (mode) {
    case 'min':
      return min;
    case 'max':
      return max;
    default:
      return (min + max) / 2;
  }
};

const inRange = (value: number, min: number, max: number) => {
  return value >= min && value <= max;
};

export class TransformationHandles {
  handles: {
    corner: { x: string; y: string };
    anchor: Point;
    topLeft: Point;
  }[] = [];
  color = 'blue'; // ABK what is a sensible default color?
  constructor(
    visualGraph: VisualGraph,
    selection: EntitySelection,
    mouse: any,
    viewTransformation: ViewTransformation
  ) {
    const nodeIds = selectedNodeIds(selection);
    if (mouse.dragType === 'NONE' && nodeIds.length > 1) {
      const box = combineBoundingBoxes(
        nodeIds.map((nodeId) => visualGraph.nodes[nodeId].boundingBox())
      );
      const dimensions = ['x', 'y'] as const;
      const modes: { x: string[]; y: string[] } = { x: [], y: [] };
      dimensions.forEach((dimension) => {
        const coordinates = nodeIds.map(
          (nodeId) => visualGraph.nodes[nodeId].position[dimension]
        );
        const min = Math.min(...coordinates);
        const max = Math.max(...coordinates);
        const spread = max - min;
        if (spread > 1) {
          modes[dimension] = ['min', 'mid', 'max'];
        } else {
          modes[dimension] = ['mid'];
        }
      });

      const transform = (position: Point) =>
        viewTransformation.transform(position);
      const corners: { x: string; y: string }[] = [];
      modes.x.forEach((x) => {
        modes.y.forEach((y) => {
          if (x !== 'mid' || y !== 'mid') {
            corners.push({ x, y });
          }
        });
      });
      this.handles = corners.map((corner) => {
        const anchor = transform(
          new Point(
            choose(corner.x, box.left, box.right),
            choose(corner.y, box.top, box.bottom)
          )
        );
        const topLeft = anchor.translate(
          new Vector(
            choose(corner.x, -handleSize, 0),
            choose(corner.y, -handleSize, 0)
          )
        );
        return {
          corner,
          anchor,
          topLeft,
        };
      });
      this.color = adaptForBackground(
        selectionHandle,
        (key) => visualGraph.style[key]
      );
    }
  }

  draw(ctx: DrawingContext) {
    this.handles.forEach((handle) => {
      drawSolidRectangle(
        ctx,
        handle.topLeft,
        handleSize,
        handleSize,
        3,
        this.color
      );
      drawSolidRectangle(
        ctx,
        handle.topLeft.translate(
          new Vector(
            handle.corner.x === 'min' ? handleSize / 2 : handlePadding,
            handle.corner.y === 'min' ? handleSize / 2 : handlePadding
          )
        ),
        handle.corner.x === 'mid'
          ? handleSize - handlePadding * 2
          : handleSize / 2 - handlePadding,
        handle.corner.y === 'mid'
          ? handleSize - handlePadding * 2
          : handleSize / 2 - handlePadding,
        2,
        'white'
      );
    });
  }

  handleAtPoint(canvasPosition: Coordinate) {
    return this.handles.find(
      (handle) =>
        inRange(
          canvasPosition.x,
          handle.topLeft.x,
          handle.topLeft.x + handleSize
        ) &&
        inRange(
          canvasPosition.y,
          handle.topLeft.y,
          handle.topLeft.y + handleSize
        )
    );
  }
}
