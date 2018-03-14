import { drawRing, drawStraightArrow, drawPolygon, drawCircle} from "./canvasRenderer";
import { defaultNewNodeRadius, defaultNodeRadius, ringMargin } from "./constants";
import { Vector } from "../model/Vector";
import { getArrowGeometryData } from "./utils/geometryUtils";
import {idsMatch} from "../model/Id";
import { green, blueGreen, purple } from "../model/colors";

export default class Gestures {
  constructor (gestures, graph) {
    this.gestures = gestures
    this.graph = graph
  }

  draw (ctx, displayOptions) {
    const { gestures, graph } = this
    const { dragging, selection } = gestures
    const transform = (position) => displayOptions.viewTransformation.transform(position)
    let newNodeRadius = defaultNodeRadius + ringMargin;

    if (selection.path.length > 0) {
      drawPolygon(ctx, selection.path, green)
      selection.path.forEach(point => drawCircle(ctx, point, 3, true))
    }

    Object.keys(selection.selectedNodeIdMap).forEach(nodeId => {
      if (!idsMatch(nodeId, dragging.sourceNodeId)) {
        const nodePosition = graph.nodes.find((node) => idsMatch(node.id, nodeId)).position;
        drawRing(ctx, transform(nodePosition), green, defaultNodeRadius + ringMargin / 2)
      }
    })

    if (dragging.sourceNodeId) {
      const sourceNodeIdPosition = graph.nodes.find((node) => idsMatch(node.id, dragging.sourceNodeId)).position;
      if (dragging.newNodePosition) {
        const delta = dragging.newNodePosition.vectorFrom(sourceNodeIdPosition)
        let newNodePosition = sourceNodeIdPosition;
        if (delta.distance() > defaultNodeRadius + ringMargin) {
          if (delta.distance() < defaultNodeRadius + defaultNewNodeRadius) {
            const ratio = (delta.distance() - defaultNodeRadius - ringMargin) / (defaultNewNodeRadius - ringMargin);
            newNodePosition = sourceNodeIdPosition.translate(delta.scale(ratio))
            newNodeRadius = defaultNodeRadius + ringMargin + (defaultNewNodeRadius - defaultNodeRadius - ringMargin) * ratio
          } else {
            newNodePosition = dragging.newNodePosition
            newNodeRadius = defaultNewNodeRadius
          }
        }

        drawRing(ctx, transform(newNodePosition), blueGreen, newNodeRadius)

        const sourcePoint = transform(sourceNodeIdPosition)
        const targetPoint = transform(newNodePosition)
        const arrowVector = new Vector(targetPoint.x - sourcePoint.x, targetPoint.y - sourcePoint.y)
        const unitVector = arrowVector.unit()
        const sourceBorderPoint = sourcePoint.translate(unitVector.scale(defaultNodeRadius))
        const targetBorderPoint = targetPoint.translate(unitVector.invert().scale(defaultNewNodeRadius))

        const arrowData = getArrowGeometryData(sourcePoint, sourceBorderPoint, targetPoint, targetBorderPoint)
        drawStraightArrow(ctx, sourceBorderPoint, targetBorderPoint, arrowData)


      } else {
        drawRing(ctx, transform(sourceNodeIdPosition), purple, defaultNodeRadius + ringMargin)
      }
    }
  }
}