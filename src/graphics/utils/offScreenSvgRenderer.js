import React from 'react';
import {calculateBoundingBox} from "./geometryUtils";
import {ViewTransformation} from "../../state/ViewTransformation";
import {getVisualGraph} from "../../selectors/index";
import {Vector} from "../../model/Vector";
import {renderToStaticMarkup} from 'react-dom/server'
import SvgAdaptor from "./SvgAdaptor";

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

  const e = React.createElement
  const svgAdaptor = new SvgAdaptor(e);
  visualGraph.draw(svgAdaptor)
  const svgString = renderToStaticMarkup(svgAdaptor.asSvg())

  const width = Math.ceil(boundingBox.width)
  const height = Math.ceil(boundingBox.height)

  return {
    width,
    height,
    dataUrl: 'data:image/svg+xml;base64,' + btoa(svgString)
  }
}