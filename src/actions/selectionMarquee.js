import {ensureSelected} from "./selection";
import { getPresentGraph } from "../selectors"
import BoundingBox from "../graphics/utils/BoundingBox";

export const setMarquee = (from, to) => ({
  type: 'SET_MARQUEE',
  marquee: {from, to},
  newMousePosition: to
})

export const selectItemsInMarquee = () => {
  return function (dispatch, getState) {
    const state = getState()
    const graph = getPresentGraph(state)
    const marquee = state.gestures.selectionMarquee
    if (marquee) {
      const boundingBox = getBBoxFromCorners(marquee)
      const selectedNodeIds = graph.nodes.filter(node => boundingBox.contains(node.position))
        .map(node => node.id)
      if (selectedNodeIds.length > 0) {
        dispatch(ensureSelected(selectedNodeIds))
      }
    }
  }
}

export const getBBoxFromCorners = ({from, to}) => new BoundingBox(
  Math.min(from.x, to.x),
  Math.max(from.x, to.x),
  Math.min(from.y, to.y),
  Math.max(from.y, to.y)
)