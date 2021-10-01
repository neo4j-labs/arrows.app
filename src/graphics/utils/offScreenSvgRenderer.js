import {ViewTransformation} from "../../state/ViewTransformation";
import {getVisualGraph} from "../../selectors/index";
import {Vector} from "../../model/Vector";
import SvgAdaptor from "./SvgAdaptor";
import { Base64 } from 'js-base64';

export const renderSvg = (graph, cachedImages) => {
  const renderState = {
    graph,
    cachedImages,
    selection: {
      entities: []
    }
  }
  const visualGraph = getVisualGraph(renderState)
  const boundingBox = visualGraph.boundingBox() || {
      left: 0, top: 0, right: 100, bottom: 100
    }

  const svgAdaptor = new SvgAdaptor()
  visualGraph.draw(svgAdaptor, {
    viewTransformation: new ViewTransformation(1,
      new Vector(-boundingBox.left, -boundingBox.top))
  })
  const width = Math.ceil(boundingBox.width)
  const height = Math.ceil(boundingBox.height)
  const svgString = new XMLSerializer().serializeToString(svgAdaptor.asSvg(width, height))

  return {
    width,
    height,
    dataUrl: 'data:image/svg+xml;base64,' + Base64.encode(svgString)
  }
}