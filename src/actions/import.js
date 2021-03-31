import {importNodesAndRelationships} from "./graph";
import {Point} from "../model/Point";
import {getPresentGraph, getVisualGraph} from "../selectors";
import {constructGraphFromFile} from "../storage/googleDriveStorage";

export const handlePaste = (pasteEvent) => {
  return function (dispatch, getState) {
    const state = getState()
    const graph = getPresentGraph(state)
    const visualGraph = getVisualGraph(state)

    const clipboardData = pasteEvent.clipboardData
    const textPlainMimeType = 'text/plain'
    if (clipboardData.types.includes(textPlainMimeType)) {
      const text = clipboardData.getData(textPlainMimeType)
      const format = formats.find(format => format.recognise(text))
      if (format) {
        try {
          const importedGraph = format.parse(text, graph, visualGraph)
          dispatch(importNodesAndRelationships(importedGraph))
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
}

const formats = [
  {
    // JSON
    recognise: (plainText) => new RegExp('^{.*\}$', 's').test(plainText.trim()),
    parse: (plainText, graph, visualGraph) => {
      const object = JSON.parse(plainText)
      const graphData = constructGraphFromFile(object)
      return graphData.graph
    }
  },
  {
    // plain text
    recognise: () => true,
    parse: (plainText, graph, visualGraph) => {
      const lines = plainText.split('\n').filter(line => line && line.trim().length > 0)

      const boundingBox = visualGraph.boundingBox()
      const top = boundingBox.top + graph.style.radius
      const left = boundingBox.right + graph.style.radius

      const nodes = lines.map((line, i) => {
        return {
          id: 'n' + i,
          position: new Point(left, top + 3 * graph.style.radius * i),
          caption: line,
          style: {},
          labels: [],
          properties: {}
        }
      })
      return {
        nodes,
        relationships: []
      }
    }
  }
]