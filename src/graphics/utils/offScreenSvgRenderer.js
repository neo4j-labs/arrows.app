import crel from 'crel';
import {ViewTransformation} from "../../state/ViewTransformation";
import {getVisualGraph} from "../../selectors/index";
import {Vector} from "../../model/Vector";
import SvgAdaptor from "./SvgAdaptor";
import { Base64 } from 'js-base64';

export const renderSvg = (graph) => {
  const renderState = {
    graph,
    selection: {
      entities: []
    }
  }
  const visualGraph = getVisualGraph(renderState)
  const boundingBox = visualGraph.boundingBox() || {
      left: 0, top: 0, right: 100, bottom: 100
    }

  const e = crel
  const svgAdaptor = new SvgAdaptor(e);
  visualGraph.draw(svgAdaptor, {
    viewTransformation: new ViewTransformation(1,
      new Vector(-boundingBox.left, -boundingBox.top))
  })
  const width = Math.ceil(boundingBox.width)
  const height = Math.ceil(boundingBox.height)
  const svgString = svgAdaptor.asSvg(width, height).outerHTML

  return {
    width,
    height,
    dataUrl: 'data:image/svg+xml;base64,' + Base64.encode(svgString)
  }
}