import { selectedNodes } from "../model/selection";

export const getSelectedNodes = state => {
  const { graph, selection, applicationLayout } = state
  const regularNodes = selectedNodes(graph, selection)

  if (applicationLayout.layers && applicationLayout.layers.length > 0) {
    const selectedNodes = applicationLayout.layers.reduce((resultNodes, layer) => {
      if (layer.selectorForInspection) {
        return resultNodes.concat(layer.selectorForInspection(state))
      } else {
        return resultNodes
      }
    }, [])
    return regularNodes.concat(selectedNodes)
  } else {
    return regularNodes
  }
}