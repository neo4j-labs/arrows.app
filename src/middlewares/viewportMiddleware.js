import { calculateBoundingBox } from "../graphics/utils/geometryUtils";
import { adjustViewport } from "../actions/viewTransformation";
import { FETCHING_GRAPH_SUCCEEDED } from "../state/storageStatus";

export const viewportMiddleware = store => next => action => {
  const result = next(action)

  if (action.type === 'FETCHING_GRAPH_SUCCEEDED' || action.category === 'GRAPH') {
    console.log('HANDLING IN VIEWPORT MIDDLEWARE')
    const { graph, windowSize } = store.getState()
    const bbox = calculateBoundingBox(Object.values(graph.nodes).map(n => n.position))
    const visualsWidth = (bbox.right - bbox.left) * 1.1
    const visualsHeight = (bbox.bottom - bbox.top) * 1.1

    const scale = Math.max((windowSize.height / 2) / visualsHeight, (windowSize.width / 2) / visualsWidth)

    console.log('BBOX', scale)
    store.dispatch(adjustViewport(scale, 0, 0))
  }

  return result
}

const viewportModifiers = [

]