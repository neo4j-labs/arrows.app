import {ViewTransformation} from "../../state/ViewTransformation";
import {getVisualGraph} from "../../selectors/index";
import {Vector} from "../../model-old/Vector";
import SvgAdaptor from "./SvgAdaptor";
import {Base64} from 'js-base64';
import {assembleGoogleFontFacesCssWithEmbeddedFontData} from "./fontWrangling";
import {usedCodePoints} from "../../model-old/Graph";

export const renderSvgDom = (graph, cachedImages) => {
  const { visualGraph, boundingBox } = createVisualGraphAndBoundingBox(graph, cachedImages)

  const width = Math.ceil(boundingBox.width)
  const height = Math.ceil(boundingBox.height)
  const svgAdaptor = new SvgAdaptor(width, height)
  visualGraph.draw(svgAdaptor, {
    viewTransformation: new ViewTransformation(1,
      new Vector(-boundingBox.left, -boundingBox.top))
  })
  return svgAdaptor.rootElement
}

export const renderSvgEncapsulated = (graph, cachedImages) => {
  return new Promise((resolve, reject) => {

    const { visualGraph, boundingBox } = createVisualGraphAndBoundingBox(graph, cachedImages)

    const width = Math.ceil(boundingBox.width)
    const height = Math.ceil(boundingBox.height)
    const svgAdaptor = new SvgAdaptor(width, height)
    visualGraph.draw(svgAdaptor, {
      viewTransformation: new ViewTransformation(1,
        new Vector(-boundingBox.left, -boundingBox.top))
    })

    const codePoints = usedCodePoints(graph)
    const fontFamily = graph.style['font-family']

    assembleGoogleFontFacesCssWithEmbeddedFontData(fontFamily, codePoints)
      .then(cssRules => {
        for (const cssText of cssRules) {
          svgAdaptor.appendCssText(cssText)
        }

        const svgString = new XMLSerializer().serializeToString(svgAdaptor.rootElement)
        resolve({
            width,
            height,
            dataUrl: 'data:image/svg+xml;base64,' + Base64.encode(svgString)
          }
        )
      })
  })
}

const createVisualGraphAndBoundingBox = (graph, cachedImages) => {
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

  return { visualGraph, boundingBox }
}