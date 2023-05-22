import {toggleSelection} from "./selection";
import BoundingBox from "../graphics/utils/BoundingBox";
import {getVisualGraph} from "../selectors/index";

export const setMarquee = (from, to) => ({
  type: 'SET_MARQUEE',
  marquee: {from, to},
  newMousePosition: to
})

export const selectItemsInMarquee = () => {
  return function (dispatch, getState) {
    const state = getState()
    const marquee = state.gestures.selectionMarquee
    if (marquee) {
      const visualGraph = getVisualGraph(state)
      const boundingBox = getBBoxFromCorners(marquee)
      const entities = visualGraph.entitiesInBoundingBox(boundingBox)
      if (entities.length > 0) {
        dispatch(toggleSelection(entities, 'or'))
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