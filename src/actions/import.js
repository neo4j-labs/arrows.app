import {importNodesAndRelationships} from "./graph";
import {Point} from "../model/Point";
import {getPresentGraph, getVisualGraph} from "../selectors";

export const handlePaste = (pasteEvent) => {
  return function (dispatch, getState) {
    const state = getState()
    const graph = getPresentGraph(state)
    const visualGraph = getVisualGraph(state)
    const boundingBox = visualGraph.boundingBox()
    const top = boundingBox.top + graph.style.radius
    const left = boundingBox.right + graph.style.radius

    const clipboardData = pasteEvent.clipboardData
    const textPlainMimeType = 'text/plain'
    if (clipboardData.types.includes(textPlainMimeType)) {
      const text = clipboardData.getData(textPlainMimeType)
      const lines = text.split('\n').filter(line => line && line.trim().length > 0)
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
      const importedGraph = {
        nodes,
        relationships: []
      }
      dispatch(importNodesAndRelationships(importedGraph))
    }
  }
}