import {calculateBoundingBox} from "./utils/geometryUtils";
import {Point} from "../model/Point";
import {drawSolidRectangle} from "./canvasRenderer";
import {Vector} from "../model/Vector";
import {green} from "../model/colors";

const handleSize = 20
const handlePadding = 2

const choose = (mode, min, max) => {
  switch (mode) {
    case 'min':
      return min
    case 'max':
      return max
    default:
      return (min + max) / 2
  }
}

const inRange = (value, min, max) => {
  return value >= min && value <= max
}

export default class TransformationHandles {
  constructor(graph, selection, viewTransformation) {
    const selectedNodes = graph.nodes.filter((node) => selection.selectedNodeIdMap.hasOwnProperty(node.id))
    if (selectedNodes.length > 1) {
      const box = calculateBoundingBox(selectedNodes, graph.style.radius, 1)
      const dimensions = ['x', 'y']
      const modes = {}
      dimensions.forEach(dimension => {
        const coordinates = selectedNodes.map(node => node.position[dimension])
        const min = Math.min(...coordinates)
        const max = Math.max(...coordinates)
        const spread = max - min
        if (spread > 1) {
          modes[dimension] = ['min', 'mid', 'max']
        } else {
          modes[dimension] = ['mid']
        }
      })

      const transform = (position) => viewTransformation.transform(position)
      const corners = []
      modes.x.forEach(x => {
        modes.y.forEach(y => {
          if (x !== 'mid' || y !== 'mid') {
            corners.push({x, y})
          }
        })
      })
      this.handles = corners.map(corner => {
        const anchor = transform(new Point(
          choose(corner.x, box.left, box.right),
          choose(corner.y, box.top, box.bottom)
        ))
        const topLeft = anchor.translate(new Vector(
          choose(corner.x, -handleSize, 0),
          choose(corner.y, -handleSize, 0)
        ))
        return {
          corner,
          anchor,
          topLeft
        }
      })
    } else {
      this.handles = []
    }
  }

  draw(ctx) {
    this.handles.forEach(handle => {
      drawSolidRectangle(ctx, handle.topLeft, handleSize, handleSize, 3, green)
      drawSolidRectangle(
        ctx, handle.topLeft.translate(new Vector(
          (handle.corner.x === 'min' ? (handleSize) / 2 : handlePadding),
          (handle.corner.y === 'min' ? (handleSize) / 2 : handlePadding)
        )),
        handle.corner.x === 'mid' ? handleSize - handlePadding * 2 : handleSize / 2 - handlePadding,
        handle.corner.y === 'mid' ? handleSize - handlePadding * 2 : handleSize / 2 - handlePadding,
        2,
        'white'
      )
    })
  }

  handleAtPoint(canvasPosition) {
    return this.handles.find(handle =>
        inRange(canvasPosition.x, handle.topLeft.x, handle.topLeft.x + handleSize) &&
        inRange(canvasPosition.y, handle.topLeft.y, handle.topLeft.y + handleSize)
    )
  }
}