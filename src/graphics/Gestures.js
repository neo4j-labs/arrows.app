import { drawArrowEndpoint, drawRing, drawStraightArrow } from "./canvasRenderer";
import { defaultNewNodeRadius, defaultNodeRadius, ringMargin } from "./constants";
import { Vector } from "../model/Vector";
import { getArrowGeometryData, getPointAtRange } from "./geometryUtils";
import {idsMatch} from "../model/Id";

export default class Gestures {
  constructor (gestures, graph) {
    this.gestures = gestures
    this.graph = graph
  }

  draw (ctx, displayOptions) {
    const { gestures, graph } = this
    const transform = (position) => displayOptions.viewTransformation.transform(position)

    if (gestures.sourceNodeId) {
      const sourceNodeIdPosition = graph.nodes.find((node) => idsMatch(node.id, gestures.sourceNodeId)).position;
      if (gestures.newNodePosition) {
        const delta = gestures.newNodePosition.vectorFrom(sourceNodeIdPosition)
        let newNodePosition = sourceNodeIdPosition;
        let newNodeRadius = defaultNodeRadius + ringMargin;
        if (delta.distance() > defaultNodeRadius + ringMargin) {
          if (delta.distance() < defaultNodeRadius + defaultNewNodeRadius) {
            const ratio = (delta.distance() - defaultNodeRadius - ringMargin) / (defaultNewNodeRadius - ringMargin);
            newNodePosition = sourceNodeIdPosition.translate(delta.scale(ratio))
            newNodeRadius = defaultNodeRadius + ringMargin + (defaultNewNodeRadius - defaultNodeRadius - ringMargin) * ratio
          } else {
            newNodePosition = gestures.newNodePosition
            newNodeRadius = defaultNewNodeRadius
          }
        }

        drawRing(ctx, transform(newNodePosition), 'blue', newNodeRadius)

        const sourcePoint = transform(sourceNodeIdPosition)
        const targetPoint = transform(newNodePosition)
        const arrowVector = new Vector(targetPoint.x - sourcePoint.x, targetPoint.y - sourcePoint.y)
        const unitVector = arrowVector.unit()
        const sourceBorderPoint = sourcePoint.translate(unitVector.scale(defaultNodeRadius))
        const targetBorderPoint = targetPoint.translate(unitVector.invert().scale(defaultNewNodeRadius))

        const arrowData = getArrowGeometryData(sourcePoint, targetPoint)
        drawStraightArrow(ctx, sourceBorderPoint, targetBorderPoint, arrowData)


      } else {
        drawRing(ctx, transform(sourceNodeIdPosition), 'grey', defaultNodeRadius + ringMargin)
      }
    }
  }
}