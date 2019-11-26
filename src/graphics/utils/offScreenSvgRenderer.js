import React from 'react';
import {ViewTransformation} from "../../state/ViewTransformation";
import {getVisualGraph} from "../../selectors/index";
import {Vector} from "../../model/Vector";
import {renderToStaticMarkup} from 'react-dom/server'
import SvgAdaptor from "./SvgAdaptor";

export const renderSvg = (graph) => {
  const renderState = {
    graph,
    selection: {
      selectedNodeIdMap: {},
      selectedRelationshipIdMap: {}
    }
  }
  const visualGraph = getVisualGraph(renderState)
  const boundingBox = visualGraph.boundingBox() || {
      left: 0, top: 0, right: 100, bottom: 100
    }

  const e = React.createElement
  const svgAdaptor = new SvgAdaptor(e);
  visualGraph.draw(svgAdaptor, {
    viewTransformation: new ViewTransformation(1,
      new Vector(-boundingBox.left, -boundingBox.top))
  })
  const width = Math.ceil(boundingBox.width)
  const height = Math.ceil(boundingBox.height)
  const svgString = renderToStaticMarkup(svgAdaptor.asSvg(width, height))

  return {
    width,
    height,
    dataUrl: 'data:image/svg+xml;base64,' + btoa(svgString)
  }
}