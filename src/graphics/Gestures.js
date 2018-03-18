import { drawRing, drawStraightArrow, drawPolygon, drawCircle} from "./canvasRenderer";
import { defaultNewNodeRadius, defaultNodeRadius, ringMargin } from "./constants";
import { Vector } from "../model/Vector";
import { getArrowGeometryData, getVoronoi, isPointInPolygon, sortPoints } from "./utils/geometryUtils";
import {idsMatch} from "../model/Id";
import { green, blueGreen, purple } from "../model/colors";
import { Point } from "../model/Point";

export default class Gestures {
  constructor (gestures, graph) {
    this.gestures = gestures
    this.graph = graph
  }

  draw (ctx, displayOptions) {
    const { gestures, graph } = this
    const { dragging, selection } = gestures
    const transform = (position) => displayOptions.viewTransformation.transform(position)
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

    let newNodeRadius = defaultNodeRadius + ringMargin;

    if (selection.marquee && graph.nodes.length > 0) {
      const marquee = selection.marquee
      const marqueeScreen = {from: transform(selection.marquee.from), to: transform(selection.marquee.to)}
      const bBox = getBbox(marquee.from, marquee.to)
      const bBoxScreen = getBbox(marqueeScreen.from, marqueeScreen.to)

      drawPolygon(ctx, bBoxScreen, null, 'black')

      const points = graph.nodes.map(node => node.position)
        .filter(point => isPointInPolygon(point, bBox))
      const voronoi = getVoronoi(points,
        marquee ? {
          xl: Math.min(marquee.from.x, marquee.to.x),
          xr: Math.max(marquee.from.x, marquee.to.x),
          yt: Math.min(marquee.from.y, marquee.to.y),
          yb: Math.max(marquee.from.y, marquee.to.y),
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

    if (selection.path.length > 0) {
      const points = sortPoints(selection.path.slice(0)).map(point => transform(new Point(point.x, point.y)))
      drawPolygon(ctx, points, green)
      points.forEach(point => drawCircle(ctx, point, 3, true))
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