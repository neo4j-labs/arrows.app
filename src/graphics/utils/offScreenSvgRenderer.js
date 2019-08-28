import {calculateBoundingBox} from "./geometryUtils";
import {ViewTransformation} from "../../state/ViewTransformation";
import {getVisualGraph} from "../../selectors/index";
import {Vector} from "../../model/Vector";

export const renderSvg = (graph) => {
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
    viewTransformation: new ViewTransformation(1,
      new Vector(-boundingBox.left, -boundingBox.top))
  }
  const visualGraph = getVisualGraph(renderState)

  // visualGraph.draw(ctx)
  const svgString = '<?xml version="1.0" encoding="UTF-8"?>    ' +
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="100" viewBox="0 0 100 100">' +
    '<circle cx="50" cy="50" r="50" fill="black"/>' +
    '</svg>'

  const width = Math.ceil(boundingBox.width)
  const height = Math.ceil(boundingBox.height)

  return {
    width,
    height,
    dataUrl: 'data:image/svg+xml;base64,' + btoa(svgString)
  }
}