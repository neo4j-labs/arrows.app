import {drawPolygon, drawRing} from "./canvasRenderer";
import {ringMargin} from "./constants";
import {getVoronoi, sortPoints} from "./utils/geometryUtils";
import {blueGreen, purple} from "../model/colors";
import {Point} from "../model/Point";
import {getBBoxFromCorners} from "../actions/selectionMarquee";
import {BalloonArrow} from "./BalloonArrow";
import {normalStraightArrow} from "./StraightArrow";

export default class Gestures {
  constructor(visualGraph, gestures) {
    this.visualGraph = visualGraph
    this.gestures = gestures
  }

  draw (ctx, displayOptions) {
    const { visualGraph, gestures } = this
    const { dragToCreate, selectionMarquee } = gestures
    const viewTransformation = displayOptions.viewTransformation
    const transform = (position) => viewTransformation.transform(position)
    const getBbox = (from, to) => [
      from, {
        x: to.x,
        y: from.y
      },
      to, {
        x: from.x,
        y: to.y
      },
      from
    ]

    if (selectionMarquee && visualGraph.graph.nodes.length > 0) {
      const marqueeScreen = {from: transform(selectionMarquee.from), to: transform(selectionMarquee.to)}
      const boundingBox = getBBoxFromCorners(selectionMarquee)
      const bBoxScreen = getBbox(marqueeScreen.from, marqueeScreen.to)

      drawPolygon(ctx, bBoxScreen, null, 'black')

      const points = visualGraph.graph.nodes.map(node => node.position)
        .filter(point => boundingBox.contains(point))
      const voronoi = getVoronoi(points,
        selectionMarquee ? {
          xl: Math.min(selectionMarquee.from.x, selectionMarquee.to.x),
          xr: Math.max(selectionMarquee.from.x, selectionMarquee.to.x),
          yt: Math.min(selectionMarquee.from.y, selectionMarquee.to.y),
          yb: Math.max(selectionMarquee.from.y, selectionMarquee.to.y),
        } : { xl: 0, xr: 0, yt: 0, yb: 0}
      )

      if (voronoi) {
        if (voronoi.cells.length === 1) {
          drawPolygon(ctx, bBoxScreen, 'aliceblue', 'black')
        } else {
          voronoi.cells.forEach(cell => {
            let points = []
            cell.halfedges.forEach(halfedge => {
              const doesPointExist = point => points.indexOf(p => p.x === point.x && p.y === point.y) >= 0
              if (!doesPointExist(halfedge.edge.va)) {
                points.push(halfedge.edge.va)
              }
              if (!doesPointExist(halfedge.edge.vb)) {
                points.push(halfedge.edge.vb)
              }
            })
            points = sortPoints(points)
            drawPolygon(ctx, points.map(point => transform(new Point(point.x, point.y))), 'aliceblue', 'black')
          })
        }
      }
    }

    const drawNewNodeAndRelationship = (sourceNodeId, targetNodeId, newNodeNaturalPosition) => {
      const sourceNode = visualGraph.nodes[sourceNodeId]
      let newNodeRadius = visualGraph.graph.style.radius
      if (sourceNode) {
        const sourceNodeRadius = sourceNode.radius
        const outerRadius = sourceNodeRadius + ringMargin
        const sourceNodePosition = sourceNode.position

        const targetNode = visualGraph.nodes[targetNodeId]
        if (targetNode) {
          newNodeRadius = targetNode.radius
        }

        if (newNodeNaturalPosition) {
          const delta = newNodeNaturalPosition.vectorFrom(sourceNodePosition)
          let newNodePosition = sourceNodePosition
          if (delta.distance() < outerRadius) {
            newNodeRadius = outerRadius
          } else {
            if (delta.distance() - sourceNodeRadius < newNodeRadius) {
              const ratio = (delta.distance() - sourceNodeRadius) / newNodeRadius
              newNodePosition = sourceNodePosition.translate(delta.scale(ratio))
              newNodeRadius = (1 - ratio) * outerRadius + ratio * newNodeRadius
            } else {
              newNodePosition = newNodeNaturalPosition
            }
          }

          drawRing(ctx, newNodePosition, blueGreen, newNodeRadius)

          const dimensions = { arrowWidth: 4, hasArrowHead: true, headWidth: 16, headHeight: 24, chinHeight:2.4, arrowColor: blueGreen }
          if (targetNode && sourceNode === targetNode) {
            const arrow = new BalloonArrow(sourceNodePosition, newNodeRadius, 0,44, 256, 40, dimensions)
            arrow.draw(ctx)
          } else {
            const arrow = normalStraightArrow(sourceNodePosition, newNodePosition, sourceNodeRadius, newNodeRadius, dimensions)
            arrow.draw(ctx)
          }
        } else {
          const drawNodeRing = sourceNode.drawRing || drawRing
          drawNodeRing(ctx, sourceNodePosition, purple, outerRadius)
        }
      }
    }

    if (dragToCreate.sourceNodeId) {
      ctx.save()
      ctx.translate(viewTransformation.offset.dx, viewTransformation.offset.dy)
      ctx.scale(viewTransformation.scale, viewTransformation.scale)

      drawNewNodeAndRelationship(
        dragToCreate.sourceNodeId,
        dragToCreate.targetNodeId,
        dragToCreate.newNodePosition
      )

      dragToCreate.secondarySourceNodeIds.forEach(secondarySourceNodeId => {
        const primarySourceNode = visualGraph.nodes[dragToCreate.sourceNodeId]
        const secondarySourceNode = visualGraph.nodes[secondarySourceNodeId]
        const displacement = secondarySourceNode.position.vectorFrom(primarySourceNode.position)

        const newNodePosition = dragToCreate.targetNodeId ?
          dragToCreate.newNodePosition :
          dragToCreate.newNodePosition.translate(displacement)

        drawNewNodeAndRelationship(
          secondarySourceNodeId,
          dragToCreate.targetNodeId,
          newNodePosition
        )
      })

      ctx.restore()
    }
  }
}