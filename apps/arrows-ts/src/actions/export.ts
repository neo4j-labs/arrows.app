import {getPresentGraph} from "../selectors";
import {selectedNodes, selectedRelationships} from "../model/selection";

export const handleCopy = () => {
  return function (dispatch:any, getState: () => any) {
    const state = getState()
    const graph = getPresentGraph(state)
    const nodes = selectedNodes(graph, state.selection)
    const relationships = selectedRelationships(graph, state.selection)
    const selectedGraph = {
      nodes,
      relationships,
      style: graph.style
    }
    const jsonString = JSON.stringify(selectedGraph, null, 2)
    navigator.clipboard.writeText(jsonString).then(function() {
      console.log("Copied to clipboard successfully! --ABK");
    }, function() {
      console.error("Unable to write to clipboard. :-( --abk");
    });
  }
}