import { drawPolygon } from './canvasRenderer';
import { ringMargin } from './constants';
import { black, blueGreen, purple } from '../model/colors';
import { BalloonArrow } from './BalloonArrow';
import { normalStraightArrow } from './StraightArrow';
import { adaptForBackground } from './backgroundColorAdaption';

export default class Gestures {
  constructor(visualGraph, gestures) {
    this.visualGraph = visualGraph;
    this.gestures = gestures;

    const style = (key) => visualGraph.style[key];
    this.marqueeColor = adaptForBackground(black, style);
    this.newEntityColor = adaptForBackground(blueGreen, style);
    this.ringReadyColor = adaptForBackground(purple, style);
  }

  draw(ctx, displayOptions) {
    const { visualGraph, gestures } = this;
    const { dragToCreate, selectionMarquee } = gestures;
    const viewTransformation = displayOptions.viewTransformation;
    const transform = (position) => viewTransformation.transform(position);
    const getBbox = (from, to) => [
      from,
      {
        x: to.x,
        y: from.y,
      },
      to,
      {
        x: from.x,
        y: to.y,
      },
      from,
    ];

    if (selectionMarquee && visualGraph.graph.nodes.length > 0) {
      const marqueeScreen = {
        from: transform(selectionMarquee.from),
        to: transform(selectionMarquee.to),
      };
      const bBoxScreen = getBbox(marqueeScreen.from, marqueeScreen.to);

      ctx.save();
      ctx.strokeStyle = this.marqueeColor;
      drawPolygon(ctx, bBoxScreen, false, true);
      ctx.restore();
    }

    const drawNewNodeAndRelationship = (
      sourceNodeId,
      targetNodeId,
      newNodeNaturalPosition
    ) => {
      const sourceNode = visualGraph.nodes[sourceNodeId];
      let newNodeRadius = visualGraph.graph.style.radius;
      if (sourceNode) {
        const sourceNodeRadius = sourceNode.radius;
        const outerRadius = sourceNodeRadius + ringMargin;
        const sourceNodePosition = sourceNode.position;

        const targetNode = visualGraph.nodes[targetNodeId];
        if (targetNode) {
          newNodeRadius = targetNode.radius;
        }

        if (newNodeNaturalPosition) {
          const delta = newNodeNaturalPosition.vectorFrom(sourceNodePosition);
          let newNodePosition = sourceNodePosition;
          if (delta.distance() < outerRadius) {
            newNodeRadius = outerRadius;
          } else {
            if (delta.distance() - sourceNodeRadius < newNodeRadius) {
              const ratio =
                (delta.distance() - sourceNodeRadius) / newNodeRadius;
              newNodePosition = sourceNodePosition.translate(
                delta.scale(ratio)
              );
              newNodeRadius = (1 - ratio) * outerRadius + ratio * newNodeRadius;
            } else {
              newNodePosition = newNodeNaturalPosition;
            }
          }

          ctx.fillStyle = this.newEntityColor;
          ctx.circle(
            newNodePosition.x,
            newNodePosition.y,
            newNodeRadius,
            true,
            false
          );

          const dimensions = {
            arrowWidth: 4,
            hasOutgoingArrowHead: true,
            headWidth: 16,
            headHeight: 24,
            chinHeight: 2.4,
            arrowColor: this.newEntityColor,
          };
          if (targetNode && sourceNode === targetNode) {
            const arrow = new BalloonArrow(
              sourceNodePosition,
              newNodeRadius,
              0,
              44,
              256,
              40,
              dimensions
            );
            arrow.draw(ctx);
          } else {
            const arrow = normalStraightArrow(
              sourceNodePosition,
              newNodePosition,
              sourceNodeRadius,
              newNodeRadius,
              dimensions
            );
            arrow.draw(ctx);
          }
        } else {
          ctx.fillStyle = this.ringReadyColor;
          ctx.circle(
            sourceNodePosition.x,
            sourceNodePosition.y,
            outerRadius,
            true,
            false
          );
        }
      }
    };

    if (dragToCreate.sourceNodeId) {
      ctx.save();
      ctx.translate(viewTransformation.offset.dx, viewTransformation.offset.dy);
      ctx.scale(viewTransformation.scale, viewTransformation.scale);

      drawNewNodeAndRelationship(
        dragToCreate.sourceNodeId,
        dragToCreate.targetNodeIds[0],
        dragToCreate.newNodePosition
      );

      dragToCreate.secondarySourceNodeIds.forEach(
        (secondarySourceNodeId, i) => {
          const primarySourceNode =
            visualGraph.nodes[dragToCreate.sourceNodeId];
          const secondarySourceNode = visualGraph.nodes[secondarySourceNodeId];
          const displacement = secondarySourceNode.position.vectorFrom(
            primarySourceNode.position
          );

          const secondaryTargetNodeId = dragToCreate.targetNodeIds[i + 1];
          if (secondaryTargetNodeId) {
            const secondaryTargetNode =
              visualGraph.nodes[secondaryTargetNodeId];

            drawNewNodeAndRelationship(
              secondarySourceNodeId,
              dragToCreate.targetNodeIds[i + 1],
              secondaryTargetNode.position
            );
          } else {
            drawNewNodeAndRelationship(
              secondarySourceNodeId,
              null,
              dragToCreate.newNodePosition.translate(displacement)
            );
          }
        }
      );

      ctx.restore();
    }
  }
}
