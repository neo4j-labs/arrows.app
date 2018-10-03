import Gestures from "./Gestures";

const layerManager = (() => {
  let layers = []
  return {
    register: (name, drawFunction) => layers.push({
      name,
      draw: drawFunction
    }),
    clear: () => {
      layers = []
    },
    renderAll: (ctx, displayOptions) => {
      layers.forEach(layer => layer.draw(ctx, displayOptions))
    }
  }
})()

export const renderVisuals = ({visuals, canvas, displayOptions}) => {
  const { visualGraph, selection, gestures, guides, handles } = visuals

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, displayOptions.canvasSize.width, displayOptions.canvasSize.height);

  const visualGestures = new Gestures(visualGraph.graph, selection, gestures)

  layerManager.clear()

  layerManager.register('GUIDES ACTUAL POSITION', guides.drawActualPosition.bind(guides))
  layerManager.register('GESTURES', visualGestures.draw.bind(visualGestures))
  layerManager.register('GRAPH', visualGraph.draw.bind(visualGraph))
  layerManager.register('HANDLES', handles.draw.bind(handles))

  layerManager.register('GUIDES SNAP LINES', guides.drawSnaplines.bind(guides))

  layerManager.renderAll(ctx, displayOptions)
}
