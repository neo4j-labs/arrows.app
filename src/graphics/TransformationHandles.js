import {calculateBoundingBox} from "./utils/geometryUtils";
import {Point} from "../model/Point";
import {drawSolidRectangle} from "./canvasRenderer";
import {Vector} from "../model/Vector";

export default class TransformationHandles {
  constructor(graph, selection, viewTransformation) {
    const selectedNodes = graph.nodes.filter((node) => selection.selectedNodeIdMap.hasOwnProperty(node.id))
    if (selectedNodes.length > 1) {
      const box = calculateBoundingBox(selectedNodes, graph.style.radius, 1)
      const transform = (position) => viewTransformation.transform(position)
      const middle = (a, b) => (a + b) / 2
      this.handles = [
        new Point(box.left, box.top),
        new Point(middle(box.left, box.right), box.top),
        new Point(box.right, box.top),
        new Point(box.right, middle(box.top, box.bottom)),
        new Point(box.right, box.bottom),
        new Point(middle(box.left, box.right), box.bottom),
        new Point(box.left, box.bottom),
        new Point(box.left, middle(box.top, box.bottom))
      ].map(corner => {
        return {
          position: transform(corner)
        }
      })
    } else {
      this.handles = []
    }
  }

  draw(ctx) {
    this.handles.forEach(handle => {
      drawSolidRectangle(ctx, handle.position, 20, 20, 3, 'blue')
      drawSolidRectangle(ctx, handle.position.translate(new Vector(2, 2)), 8, 8, 2, 'white')
    })
  }
}