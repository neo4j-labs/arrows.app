import { drawRing, drawStraightArrow } from "./canvasRenderer";
import { defaultNewNodeRadius, defaultNodeRadius, ringMargin } from "./constants";
import { Vector } from "../model/Vector";

export default class Gestures {
  constructor (gestures, graph) {
    this.gestures = gestures
    this.graph = graph
  }

  draw (ctx, displayOptions) {
    const { gestures, graph } = this
    const transform = (position) => displayOptions.viewTransformation.transform(position)

    if (gestures.activeRing) {
      const activeRingPosition = graph.nodes.find((node) => node.idMatches(gestures.activeRing)).position;
      if (gestures.newNodePosition) {
        const delta = gestures.newNodePosition.vectorFrom(activeRingPosition)
        let newNodePosition = activeRingPosition;
        let newNodeRadius = defaultNodeRadius + ringMargin;
        if (delta.distance() > defaultNodeRadius + ringMargin) {
          if (delta.distance() < defaultNodeRadius + defaultNewNodeRadius) {
            const ratio = (delta.distance() - defaultNodeRadius - ringMargin) / (defaultNewNodeRadius - ringMargin);
            newNodePosition = activeRingPosition.translate(delta.scale(ratio))
            newNodeRadius = defaultNodeRadius + ringMargin + (defaultNewNodeRadius - defaultNodeRadius - ringMargin) * ratio
          } else {
            newNodePosition = gestures.newNodePosition
            newNodeRadius = defaultNewNodeRadius
          }
        }

        drawRing(ctx, transform(newNodePosition), 'blue', newNodeRadius)

        const sourcePoint = transform(gestures.originalPosition)
        const targetPoint = transform(newNodePosition)
        const arrowVector = new Vector(targetPoint.x - sourcePoint.x, targetPoint.y - sourcePoint.y)
        const unitVector = arrowVector.unit()
        const sourceBorderPoint = sourcePoint.translate(unitVector.scale(defaultNodeRadius))
        const targetBorderPoint = targetPoint.translate(unitVector.invert().scale(defaultNewNodeRadius))
        drawStraightArrow(ctx, sourceBorderPoint, targetBorderPoint)
      } else {
        drawRing(ctx, transform(activeRingPosition), 'grey', defaultNodeRadius + ringMargin)
      }
    }
  }
}