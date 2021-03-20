import {importNodesAndRelationships} from "./graph";
import {Point} from "../model/Point";

export const handlePaste = (pasteEvent) => {
  return function (dispatch) {
    const clipboardData = pasteEvent.clipboardData
    const textPlainMimeType = 'text/plain'
    if (clipboardData.types.includes(textPlainMimeType)) {
      const text = clipboardData.getData(textPlainMimeType)
      const lines = text.split('\n').filter(line => line && line.trim().length > 0)
      const nodes = lines.map((line, i) => {
        return {
          id: 'n' + i,
          position: new Point(0, 100 * i),
          caption: line,
          style: {},
          labels: [],
          properties: {}
        }
      })
      const graph = {
        nodes,
        relationships: []
      }
      dispatch(importNodesAndRelationships(graph))
    }
  }
}