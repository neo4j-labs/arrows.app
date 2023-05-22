import {Graph, ViewTransformation} from "@neo4j-arrows/model";
import {getVisualGraph} from "./selectors";
import {Vector} from "@neo4j-arrows/model";
import {SvgAdaptor} from "./SvgAdaptor";
import {Base64} from 'js-base64';
import {assembleGoogleFontFacesCssWithEmbeddedFontData} from "./fontWrangling";
import {usedCodePoints} from "@neo4j-arrows/model";
import { ImageInfo } from "./ImageCache";

export const renderSvgDom = (graph:Graph, cachedImages:Record<string, ImageInfo>) => {
  const { visualGraph, boundingBox } = createVisualGraphAndBoundingBox(graph, cachedImages)

  const width = Math.ceil(boundingBox.width)
  const height = Math.ceil(boundingBox.height)
  const svgAdaptor = new SvgAdaptor(width, height)
  visualGraph.draw(svgAdaptor, {
    viewTransformation: new ViewTransformation(1,
      new Vector(-boundingBox.left, -boundingBox.top)),
      canvasSize: {
        width, height
      }
  })
  return svgAdaptor.rootElement
}

export const renderSvgEncapsulated = (graph:Graph, cachedImages:Record<string,ImageInfo>) => {
  return new Promise((resolve, reject) => {

    const { visualGraph, boundingBox } = createVisualGraphAndBoundingBox(graph, cachedImages)

    const width = Math.ceil(boundingBox.width)
    const height = Math.ceil(boundingBox.height)
    const svgAdaptor = new SvgAdaptor(width, height)
    visualGraph.draw(svgAdaptor, {
      viewTransformation: new ViewTransformation(1,
        new Vector(-boundingBox.left, -boundingBox.top)),
      canvasSize: {
        width, height
      }
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

const createVisualGraphAndBoundingBox = (graph:Graph, cachedImages:Record<string, ImageInfo>) => {
  const renderState = {
    graph,
    cachedImages,
    selection: {
      entities: []
    }
  }
  const visualGraph = getVisualGraph(renderState)
  const boundingBox = visualGraph.boundingBox() || {
    left: 0, top: 0, right: 100, bottom: 100,
    width: 100, height: 100
  }

  return { visualGraph, boundingBox }
}