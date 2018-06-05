import {nodesInsidePolygon} from "../model/Graph";
import {ensureSelected} from "./selection";

export const setMarquee = (from, to) => ({
  type: 'SET_MARQUEE',
  marquee: {from, to},
  newMousePosition: to
})

export const selectNodesInMarquee = () => {
  return function (dispatch, getState) {
    const {graph, gestures} = getState()
    const marquee = gestures.selectionMarquee
    if (marquee) {
      const bBox = getBBoxFromCorners(marquee)
      const selectedNodeIds = nodesInsidePolygon(graph, bBox)
      if (selectedNodeIds.length > 0) {
        dispatch(ensureSelected(selectedNodeIds))
      }
    }
  }
}

const getBBoxFromCorners = ({from, to}) => [
  from, {
    x: to.x,
    y: from.y
  },
  to, {
    x: from.x,
    y: to.y
  },
  from
]