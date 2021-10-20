import {ViewTransformation} from "../../state/ViewTransformation";
import {getVisualGraph} from "../../selectors/index";
import {Vector} from "../../model/Vector";
import SvgAdaptor from "./SvgAdaptor";
import { Base64 } from 'js-base64';
import {fonts} from "../../model/fonts";

export const renderSvgDom = (graph, cachedImages) => {
  const { visualGraph, boundingBox } = createVisualGraphAndBoundingBox(graph, cachedImages)

  const svgAdaptor = new SvgAdaptor()
  visualGraph.draw(svgAdaptor, {
    viewTransformation: new ViewTransformation(1,
      new Vector(-boundingBox.left, -boundingBox.top))
  })
  const width = Math.ceil(boundingBox.width)
  const height = Math.ceil(boundingBox.height)
  return svgAdaptor.asSvg(width, height)
}

export const renderSvgEncapsulated = (graph, cachedImages) => {
  return new Promise((resolve, reject) => {

    const { visualGraph, boundingBox } = createVisualGraphAndBoundingBox(graph, cachedImages)

    const svgAdaptor = new SvgAdaptor()
    visualGraph.draw(svgAdaptor, {
      viewTransformation: new ViewTransformation(1,
        new Vector(-boundingBox.left, -boundingBox.top))
    })
    const width = Math.ceil(boundingBox.width)
    const height = Math.ceil(boundingBox.height)

    Promise.all(fonts.map(font => fetchFont(font.fontFamily, font.fontUrl)))
      .then(loadedFonts => {
        for (const {fontFamily, fontDataUrl} of loadedFonts) {
          svgAdaptor.cssRule('@font-face', {
            'font-family': `'${fontFamily}'`,
            'font-style': "'normal'",
            'font-weight': 400,
            'src': `url(${fontDataUrl}) format('woff')`,
            'unicode-range': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'
          })
        }

        const svgString = new XMLSerializer().serializeToString(svgAdaptor.asSvg(width, height))
        resolve({
            width,
            height,
            dataUrl: 'data:image/svg+xml;base64,' + Base64.encode(svgString)
          }
        )
      })
  })
}

const fetchFont = (fontFamily, url) => {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader()
        reader.addEventListener('load', function () {
          resolve({ fontFamily, fontDataUrl: reader.result})
        })
        reader.readAsDataURL(blob)
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