import {calculateBoundingBox} from "./geometryUtils";
import {ViewTransformation} from "../../state/ViewTransformation";
import {getVisualGraph} from "../../selectors/index";
import {defaultNewNodeRadius} from "../constants";
import {Vector} from "../../model/Vector";

export const renderGraphAtScaleFactor = (graph, scaleFactor) => {
  const boundingBox = calculateBoundingBox(graph.nodes, defaultNewNodeRadius, 1) || {
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
  canvas.width = Math.ceil(scaleFactor * boundingBox.width)
  canvas.height = Math.ceil(scaleFactor * boundingBox.height)
  const ctx = canvas.getContext('2d');
  visualGraph.draw(ctx)
  return canvas.toDataURL()
}