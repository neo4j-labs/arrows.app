import { calculateBoundingBox } from "../graphics/utils/geometryUtils"
import { adjustViewport } from "../actions/viewTransformation"
import { FETCHING_GRAPH_SUCCEEDED } from "../state/storageStatus"
import { Point } from "../model/Point"
import { ViewTransformation } from "../state/ViewTransformation";
import { Vector } from "../model/Vector";

const observedActionTypes = [
  'MOVE_NODES',
  'MOVE_NODES_END_DRAG',
  'FETCHING_GRAPH_SUCCEEDED'
]

export const calculateScaling = (nodes, radius, windowSize, viewTransformation, action) => {
  const node = action.nodePositions[0]  // nodes.find(n => n.id === action.nodeId)
  const position = viewTransformation.transform(node.position)

  const leftOverflow = 0 - (position.x - radius)
  const rightOverflow =  (position.x + radius) - windowSize.width
  const topOverflow = 0 - (position.y - radius)
  const bottomOverflow = (position.y + radius) - windowSize.height

  const horizontalExp = leftOverflow > 0 ? -1 * leftOverflow : (rightOverflow > 0 ? rightOverflow : 0)
  const verticalExp = topOverflow > 0 ? -1 * topOverflow : (bottomOverflow > 0 ? bottomOverflow : 0)

  let expansionVector = new Vector(horizontalExp, verticalExp)

  const expansionRatio = ((windowSize.width + Math.abs(horizontalExp)) * (windowSize.height + Math.abs(verticalExp))) / (windowSize.width * windowSize.height)
  return { expansionRatio, expansionVector }
}

export const calculateViewportTranslation = (nodes, radius, windowSize) => {
  const boundingBox = calculateBoundingBox(nodes, radius, 1)

  if (boundingBox) {
    let visualsWidth = (boundingBox.right - boundingBox.left)
    let visualsHeight = (boundingBox.bottom - boundingBox.top)
    let visualsCenter = new Point((boundingBox.right + boundingBox.left) / 2, (boundingBox.bottom + boundingBox.top) / 2)

    const viewportWidth = windowSize.width
    const viewportHeight = windowSize.height
    const viewportCenter = new Point(viewportWidth / 2, viewportHeight / 2)

    let scale = Math.min(1, Math.min(viewportHeight / visualsHeight, viewportWidth / visualsWidth))

    if (scale !== 1) {
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

    if (action.type === 'FETCHING_GRAPH_SUCCEEDED' || action.type === 'MOVE_NODES_END_DRAG') {
      let { scale, translateVector } = calculateViewportTranslation(nodes, graph.style.radius, windowSize)
      store.dispatch(adjustViewport(scale, translateVector.dx, translateVector.dy))
    } else {
      const { expansionRatio, expansionVector } = calculateScaling(nodes, graph.style.radius, windowSize, viewTransformation, action)
      let panX = viewTransformation.offset.dx
      let panY = viewTransformation.offset.dy

      if (expansionRatio > 1) {
        let newScale = viewTransformation.scale / expansionRatio
        panX -= expansionVector.dx
        panY -= expansionVector.dy
        store.dispatch(adjustViewport(newScale, panX, panY))
      }
    }
  }

  return result
}