import { calculateBoundingBox } from "../graphics/utils/geometryUtils"
import { adjustViewport } from "../actions/viewTransformation"
import { FETCHING_GRAPH_SUCCEEDED } from "../state/storageStatus"
import { Point } from "../model/Point"

const observedActionTypes = [
  'MOVE_NODES',
  'MOVE_NODES_END_DRAG',
  'FETCHING_GRAPH_SUCCEEDED'
]

export const viewportMiddleware = store => next => action => {
  const result = next(action)

  if (observedActionTypes.includes(action.type)) {
    console.log('HANDLING IN VIEWPORT MIDDLEWARE')
    const { graph, windowSize, viewTransformation } = store.getState()
    const bbox = calculateBoundingBox(Object.values(graph.nodes), graph.style.radius, 1)

    if (bbox) {
      let visualsWidth = (bbox.right - bbox.left) + 100
      let visualsHeight = (bbox.bottom - bbox.top) + 100
      let visualsCenter = new Point((bbox.right + bbox.left) / 2, (bbox.bottom + bbox.top) / 2)

      const viewportWidth = windowSize.width
      const viewportHeight = windowSize.height
      const viewportCenter = new Point(viewportWidth / 2, viewportHeight / 2)

      let scale = Math.min(1, Math.min(viewportHeight / visualsHeight, viewportWidth / visualsWidth))
      let panX = viewTransformation.offset.dx
      let panY = viewTransformation.offset.dy

      if (scale !== 1) {
        const scaledbbox = calculateBoundingBox(Object.values(graph.nodes), graph.style.radius, scale)
        visualsCenter = new Point((scaledbbox.right + scaledbbox.left) / 2, (scaledbbox.bottom + scaledbbox.top) / 2)
      }

      const scaleChanges = scale !== viewTransformation.scale

      if (scaleChanges || action.type === 'FETCHING_GRAPH_SUCCEEDED') {

        if (scale > viewTransformation.scale || action.type !== 'MOVE_NODES') {
          const translateVector = viewportCenter.vectorFrom(visualsCenter)
          panX = translateVector.dx // viewportCenter.x - visualsCenter.x
          panY = translateVector.dy// viewportCenter.y - visualsCenter.y
        }
      }

      /*if (visualsWidth > 0 && visualsHeight > 0) {
        scale = Math.min(viewportHeight / visualsHeight, viewportWidth / visualsWidth)
        visualsCenter = new Point(viewportWidth / 2, viewportHeight / 2)
        //let
       /!* visualsWidth /= 2
        visualsHeight /= 2*!/
      } else {
        scale = 1
        visualsWidth = bbox.left
        visualsHeight = bbox.top
      }

      const panX = -(visualsWidth - ((viewportWidth * scale) / 2))
      const panY = (visualsHeight - ((viewportHeight * scale) / 2))
      */

      console.log('BBOX', scale, panX, panY)
      store.dispatch(adjustViewport(scale, panX, panY))
    }
  }

  return result
}

const viewportModifiers = [

]