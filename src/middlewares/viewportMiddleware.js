import { calculateBoundingBox } from "../graphics/utils/geometryUtils"
import { adjustViewport } from "../actions/viewTransformation"
import { Point } from "../model/Point"
import { ViewTransformation } from "../state/ViewTransformation";
import { Vector } from "../model/Vector";
import { tryMoveNode } from "../actions/graph";
import {computeCanvasSize} from "../model/applicationLayout";

const observedActionTypes = [
  'MOVE_NODES',
  'MOVE_NODES_END_DRAG',
  'FETCHING_GRAPH_SUCCEEDED',
  'DUPLICATE_NODES_AND_RELATIONSHIPS',
  'DELETE_NODES_AND_RELATIONSHIPS',
  'WINDOW_RESIZED',
  'SHOW_INSPECTOR',
  'HIDE_INSPECTOR'
]

export const calculateScaling = (nodes, defaultRadius, canvasSize, viewTransformation, action) => {
  const node =  nodes.find(n => n.id === action.nodePositions[0].nodeId)
  const position = viewTransformation.transform(node.position)
  let radius = viewTransformation.scale * ((node.style && node.style.radius) || defaultRadius)

  const leftOverflow = 0 - (position.x - radius)
  const rightOverflow =  (position.x + radius) - canvasSize.width
  const topOverflow = 0 - (position.y - radius)
  const bottomOverflow = (position.y + radius) - canvasSize.height

  const horizontalExp = leftOverflow > 0 ? -1 * leftOverflow : (rightOverflow > 0 ? rightOverflow : 0)
  const verticalExp = topOverflow > 0 ? -1 * topOverflow : (bottomOverflow > 0 ? bottomOverflow : 0)

  const expansionRatio = Math.max((canvasSize.width + Math.abs(horizontalExp)) / canvasSize.width, (canvasSize.height + Math.abs(verticalExp)) / canvasSize.height)

  return expansionRatio > 1
}

export const calculateViewportTranslation = (nodes, radius, canvasSize) => {
  const boundingBox = calculateBoundingBox(nodes, radius, 1)

  if (boundingBox) {
    let visualsWidth = (boundingBox.right - boundingBox.left)
    let visualsHeight = (boundingBox.bottom - boundingBox.top)
    let visualsCenter = new Point((boundingBox.right + boundingBox.left) / 2, (boundingBox.bottom + boundingBox.top) / 2)

    const viewportWidth = canvasSize.width
    const viewportHeight = canvasSize.height
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
    const { graph, applicationLayout, viewTransformation, mouse } = store.getState()
    const nodes = graph.nodes
    const canvasSize = computeCanvasSize(applicationLayout)

    if (action.type === 'MOVE_NODES') {
      const shouldScaleUp = calculateScaling(nodes, graph.style.radius, canvasSize, viewTransformation, action)
      if (shouldScaleUp) {
        let { scale, translateVector } = calculateViewportTranslation(nodes, graph.style.radius, canvasSize)

        store.dispatch(adjustViewport(scale, translateVector.dx, translateVector.dy))

        if (mouse.mouseToNodeVector) {
          const newViewTransformation = new ViewTransformation(scale, new Vector(translateVector.dx, translateVector.dy))
          const mousePositionInGraph = newViewTransformation.inverse(action.newMousePosition || mouse.mousePosition)

          const expectedNodePositionbyMouse = mousePositionInGraph.translate(mouse.mouseToNodeVector.scale(viewTransformation.scale))
          const differenceVector = expectedNodePositionbyMouse.vectorFrom(action.nodePositions[0].position)

          if (differenceVector.distance() > 1) {
            window.requestAnimationFrame(() => store.dispatch(tryMoveNode({
              nodeId: action.nodePositions[0].nodeId,
              oldMousePosition: action.oldMousePosition,
              newMousePosition: null,
              forcedNodePosition: expectedNodePositionbyMouse
            })))
          }
        }
      } else {
        if (mouse.mouseToNodeVector) {
          const mousePositionInGraph = viewTransformation.inverse(mouse.mousePosition)
          const expectedNodePositionbyMouse = mousePositionInGraph.translate(mouse.mouseToNodeVector.scale(viewTransformation.scale))
          const differenceVector = expectedNodePositionbyMouse.vectorFrom(action.nodePositions[0].position)

          if (differenceVector.distance() > graph.style.radius / 2) {
            window.requestAnimationFrame(() => store.dispatch(tryMoveNode({
              nodeId: action.nodePositions[0].nodeId,
              oldMousePosition: action.oldMousePosition,
              newMousePosition: null,
              forcedNodePosition: expectedNodePositionbyMouse
            })))
          }
        }
      }
    } else {
      let { scale, translateVector } = calculateViewportTranslation(nodes, graph.style.radius, canvasSize)

      if (scale) {
       if (action.type === 'MOVE_NODES_END_DRAG') {
          if (scale > viewTransformation.scale) {
            let currentStep = 0
            let duration    = 1000
            let fps         = 60

            const targetViewTransformation = new ViewTransformation(scale, new Vector(translateVector.dx, translateVector.dy))
            const { scaleTable, panningTable } = calculateTransformationTable(viewTransformation, targetViewTransformation, duration / fps)

            const animateScale = () => {
              setTimeout(() => {
                const nextScale = scaleTable[currentStep]
                const nextPan = panningTable[currentStep]

                store.dispatch(adjustViewport(nextScale, nextPan.dx, nextPan.dy))

                currentStep++
                if (currentStep < scaleTable.length) {
                  window.requestAnimationFrame(animateScale)
                }
              }, 1000 / fps)
            }

            window.requestAnimationFrame(animateScale)
          } else if (scale !== viewTransformation.scale) {
            store.dispatch(adjustViewport(scale, translateVector.dx, translateVector.dy))
          }
        } else {
          store.dispatch(adjustViewport(scale, translateVector.dx, translateVector.dy))
        }
      }
    }
  }

  return result
}

const calculateTransformationTable = (currentViewTransformation, targetViewTransformation, totalSteps) => {
  let lastScale = currentViewTransformation.scale
  const targetScale = targetViewTransformation.scale
  const scaleByStep = (targetScale - lastScale) / totalSteps

  let lastPan = {
    dx: currentViewTransformation.offset.dx,
    dy: currentViewTransformation.offset.dy
  }
  const panByStep = {
    dx: (targetViewTransformation.offset.dx - lastPan.dx) / totalSteps,
    dy: (targetViewTransformation.offset.dy - lastPan.dy) / totalSteps
  }

  const scaleTable = []
  const panningTable = []
  let stepIndex = 0

  while (stepIndex < totalSteps - 1) {
    lastScale += scaleByStep
    lastPan = {
      dx: lastPan.dx + panByStep.dx,
      dy: lastPan.dy + panByStep.dy
    }

    scaleTable.push(lastScale)
    panningTable.push(lastPan)

    stepIndex++
  }

  // because of decimal figures does not sum up to exact number
  scaleTable.push(targetViewTransformation.scale)
  panningTable.push(targetViewTransformation.offset)

  return  {
    scaleTable,
    panningTable
  }
}
