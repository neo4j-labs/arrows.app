import {importNodesAndRelationships, setArrowsProperty} from "./graph";
import {Point} from "../model/Point";
import {getPresentGraph} from "../selectors";
import {constructGraphFromFile} from "../storage/googleDriveStorage";
import {translate} from "../model/Node";
import {Vector} from "../model/Vector";
import {hideImportDialog} from "./applicationDialogs";
import {shrinkImageUrl} from "../graphics/utils/resizeImage";
import {Base64} from "js-base64";

export const tryImport = (dispatch) => {
  return function (text, separation) {
    let importedGraph

    const format = formats.find(format => format.recognise(text))
    if (format) {
      try {
        importedGraph = format.parse(text, separation)
      } catch (e) {
        return {
          errorMessage: e.toString()
        }
      }
    } else {
      return {
        errorMessage: 'No format found'
      }
    }

    dispatch(importNodesAndRelationships(importedGraph))
    dispatch(hideImportDialog())
    return {}
  }
}

export const interpretClipboardData = (clipboardData, nodeSpacing, handlers) => {
  const textPlainMimeType = 'text/plain'
  if (clipboardData.types.includes(textPlainMimeType)) {
    const text = clipboardData.getData(textPlainMimeType)
    const format = formats.find(format => format.recognise(text))
    if (format) {
      try {
        switch (format.outputType) {
          case 'graph':
            const importedGraph = format.parse(text, nodeSpacing)
            handlers.onGraph && handlers.onGraph(importedGraph)
            break

          case 'svg':
            const svgImageUrl = format.parse(text)
            handlers.onSvgImageUrl && handlers.onSvgImageUrl(svgImageUrl)
            break
        }
      } catch (e) {
        console.error(e)
      }
    }
  } else if (clipboardData.types.includes('Files')) {
    const reader = new FileReader()
    reader.readAsDataURL(clipboardData.files[0]);
    reader.onloadend = function() {
      const imageUrl = reader.result
      handlers.onPngImageUrl && handlers.onPngImageUrl(imageUrl)
    }
  }
}

export const handlePaste = (pasteEvent) => {
  return function (dispatch, getState) {
    const state = getState()
    const separation = nodeSeparation(state)

    const clipboardData = pasteEvent.clipboardData
    interpretClipboardData(clipboardData, separation, {
      onGraph: (graph) => {
        dispatch(importNodesAndRelationships(graph))
      },
      onPngImageUrl: (imageUrl) => {
        shrinkImageUrl(imageUrl, 1024 * 10).then(shrunkenImageUrl => {
          dispatch(setArrowsProperty(state.selection, 'node-background-image', shrunkenImageUrl))
        })
      },
      onSvgImageUrl: (imageUrl) => {
        dispatch(setArrowsProperty(state.selection, 'node-icon-image', imageUrl))
      }
    })
  }
}

const formats = [
  {
    // JSON
    recognise: (plainText) => new RegExp('^{.*\}$', 's').test(plainText.trim()),
    outputType: 'graph',
    parse: (plainText) => {
      const object = JSON.parse(plainText)
      const graphData = constructGraphFromFile(object)
      const { nodes, relationships } = graphData.graph
      const left = Math.min(...nodes.map(node => node.position.x))
      const top = Math.min(...nodes.map(node => node.position.y))
      const vector = new Vector(-left, -top)
      const originNodes = nodes.map(node => translate(node, vector))
      return {
        nodes: originNodes, relationships
      }
    }
  },
  {
    // SVG
    recognise: (plainText) => {
      const xmlDocument = new DOMParser().parseFromString(plainText, "image/svg+xml")
      return xmlDocument.documentElement.tagName === 'svg'
    },
    outputType: 'svg',
    parse: (plainText) => {
      return 'data:image/svg+xml;base64,' + Base64.encode(plainText)
    }
  },
  {
    // plain text
    recognise: () => true,
    outputType: 'graph',
    parse: (plainText, separation) => {
      const lines = plainText.split('\n').filter(line => line && line.trim().length > 0)

      const nodes = lines.flatMap((line, row) => {
        const cells = line.split('\t')
        return cells.map((cell, column) => {
          return {
            id: 'n' + lines.length * column + row,
            position: new Point(separation * column, separation * row),
            caption: cell,
            style: {},
            labels: [],
            properties: {}
          }
        })
      })
      return {
        nodes,
        relationships: []
      }
    }
  }
]

export const nodeSeparation = (state) => {
  const graph = getPresentGraph(state)
  return graph.style.radius * 2.5
}