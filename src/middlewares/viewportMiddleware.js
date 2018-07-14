import { calculateBoundingBox } from "../graphics/utils/geometryUtils"
import { adjustViewport } from "../actions/viewTransformation"
import { FETCHING_GRAPH_SUCCEEDED } from "../state/storageStatus"
import { Point } from "../model/Point"

const observedActionTypes = [
  'MOVE_NODES',
  'MOVE_NODES_END_DRAG',
  'FETCHING_GRAPH_SUCCEEDED'
]

export const calculateViewportTranslation = (nodes, radius, windowSize, viewTransformation) => {
  const boundingBox = calculateBoundingBox(nodes, radius, 1)

  if (boundingBox) {

    let visualsWidth = (boundingBox.right - boundingBox.left) + 50
    let visualsHeight = (boundingBox.bottom - boundingBox.top) + 50
    let visualsCenter = new Point((boundingBox.right + boundingBox.left) / 2, (boundingBox.bottom + boundingBox.top) / 2)

    const viewportWidth = windowSize.width
    const viewportHeight = windowSize.height
    const viewportCenter = new Point(viewportWidth / 2, viewportHeight / 2)

    let scale = Math.min(1, Math.min(viewportHeight / visualsHeight, viewportWidth / visualsWidth))

    if (scale !== 1) {
      /*if (scale < viewTransformation.scale) {
        scale = scale * 0.95
      }*/
      const scaledbbox = calculateBoundingBox(nodes, radius, scale)
      visualsCenter = new Point((scaledbbox.right + scaledbbox.left) / 2, (scaledbbox.bottom + scaledbbox.top) / 2)
    }

    return {
      scale,
      translateVector: viewportCenter.vectorFrom(visualsCenter)
    }
  } else {
    return {}
  }
}

export const viewportMiddleware = store => next => action => {
  const result = next(action)

  if (observedActionTypes.includes(action.type)) {
    const { graph, windowSize, viewTransformation } = store.getState()
    // console.log('HANDLING IN VIEWPORT MIDDLEWARE', action.type, viewTransformation)
    const nodes = graph.nodes //.map(node => ({ id: node.id, position: node.position, style: node.style }))

    let { scale, translateVector } = calculateViewportTranslation(nodes, graph.style.radius, windowSize, viewTransformation)

    if (scale && translateVector) {
      let panX = viewTransformation.offset.dx
      let panY = viewTransformation.offset.dy

      const scaleChanges = scale !== viewTransformation.scale

      if (scaleChanges || action.type === 'FETCHING_GRAPH_SUCCEEDED') {
        switch (action.type) {
          case 'MOVE_NODES_END_DRAG':
          case 'FETCHING_GRAPH_SUCCEEDED':
            // console.log('ACTION', action.type)
            panX = translateVector.dx
            panY = translateVector.dy
            break
          case 'MOVE_NODES':
            console.log('ACTION at MOVE NODES', action)
            if (scale > viewTransformation.scale) {
              scale = viewTransformation.scale
            } else {
              const mouseDelta = action.newMousePosition.vectorFrom(action.oldMousePosition)
              const deltaDistance = mouseDelta.distance()
              console.log('Delta Distance', deltaDistance)
              panX = translateVector.dx
              panY = translateVector.dy
            }
          default:
            break
        }
      }

      // console.log('HANDLED IT', scale, panX, panY)

      store.dispatch(adjustViewport(scale, panX, panY))
    }
  }

  return result
}