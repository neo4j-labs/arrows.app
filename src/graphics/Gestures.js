import { drawRing, drawPolygon } from "./canvasRenderer";
import { ringMargin as defaultRingMargin } from "./constants";
import { getVoronoi, sortPoints } from "./utils/geometryUtils";
import {idsMatch} from "../model/Id";
import { green, blueGreen, purple } from "../model/colors";
import { Point } from "../model/Point";
import {StraightArrow} from "./StraightArrow";
import {getBBoxFromCorners} from "../actions/selectionMarquee";
import {selectedNodeIds} from "../model/selection";

export default class Gestures {
  constructor(visualGraph, selection, gestures) {
    this.visualGraph = visualGraph
    this.selection = selection
    this.gestures = gestures
  }

  draw (ctx, displayOptions) {
    const { visualGraph, selection, gestures } = this
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

    const ringMargin = defaultRingMargin * viewTransformation.scale

    let newNodeRadius = visualGraph.graph.style.radius * viewTransformation.scale

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

    selectedNodeIds(selection).forEach(nodeId => {
      if (!idsMatch(nodeId, dragToCreate.sourceNodeId)) {
        const visualNode = visualGraph.nodes[nodeId]
        if (visualNode) {
          const nodeRadius = visualNode.radius
          drawRing(ctx, transform(visualNode.position), green, (nodeRadius * viewTransformation.scale + ringMargin / 2))
        }
      }
    })

    if (dragToCreate.sourceNodeId) {
      const sourceNode = visualGraph.nodes[dragToCreate.sourceNodeId]
      if (sourceNode) {
        const radius = sourceNode.radius * viewTransformation.scale
        const outerRadius = radius + ringMargin
        const sourceNodeIdPosition = sourceNode.position

        const targetNode = visualGraph.nodes[dragToCreate.targetNodeId]
        if (targetNode) {
          newNodeRadius = targetNode.radius * viewTransformation.scale
        }

        if (dragToCreate.newNodePosition) {
          const delta = dragToCreate.newNodePosition.vectorFrom(sourceNodeIdPosition)
          let newNodePosition = sourceNodeIdPosition;
          if (delta.distance() > outerRadius) {
            if (delta.distance() < radius + outerRadius) {
              const ratio = (delta.distance() - radius - ringMargin) / radius
              newNodePosition = sourceNodeIdPosition.translate(delta.scale(ratio))
              newNodeRadius *= ratio
            } else {
              newNodePosition = dragToCreate.newNodePosition
            }
          }

          drawRing(ctx, transform(newNodePosition), blueGreen, newNodeRadius)

          const sourcePoint = transform(sourceNodeIdPosition)
          const targetPoint = transform(newNodePosition)
          const arrow = new StraightArrow(sourcePoint, targetPoint, radius, newNodeRadius, 4, 16, 24, 2.4, blueGreen)
          arrow.draw(ctx)
        } else {
          const drawNodeRing = sourceNode.drawRing || drawRing
          drawNodeRing(ctx, transform(sourceNodeIdPosition), purple, outerRadius)
        }
      }
    }
  }
}