import {calculateBoundingBox} from "./geometryUtils";
import {ViewTransformation} from "../../state/ViewTransformation";
import {getVisualGraph} from "../../selectors/index";
import {Vector} from "../../model/Vector";

export const renderGraphAtScaleFactor = (graph, scaleFactor, transparentBackground) => {
  const boundingBox = calculateBoundingBox(graph.nodes, graph, 1) || {
      left: 0, top: 0, right: 100, bottom: 100
    }
  boundingBox.width = boundingBox.right - boundingBox.left
  boundingBox.height = boundingBox.bottom - boundingBox.top
  const renderState = {
    graph,
    selection: {
      selectedNodeIdMap: {},
      selectedRelationshipIdMap: {}
    },
    viewTransformation: new ViewTransformation(scaleFactor,
      new Vector(-scaleFactor * boundingBox.left, -scaleFactor * boundingBox.top))
  }
  const visualGraph = getVisualGraph(renderState)

  const canvas = window.document.createElement('canvas')
  const canvasWidth = Math.ceil(scaleFactor * boundingBox.width);
  const canvasHeight = Math.ceil(scaleFactor * boundingBox.height);
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')
  if (!transparentBackground) {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }
  visualGraph.draw(ctx)
  return canvas.toDataURL()
}