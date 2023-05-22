import { Guides } from "@neo4j-arrows/model";
import { BackgroundImage } from "./BackgroundImage";
import Gestures, { GestureComponents } from "./Gestures";
import {CanvasAdaptor} from "./utils/CanvasAdaptor";
import { DisplayOptions } from "./utils/DisplayOptions";
import { VisualGraph } from "./VisualGraph";
import {VisualGuides} from "./VisualGuides";
import { TransformationHandles } from "./TransformationHandles";
import { DrawingContext } from "./utils/DrawingContext";

export type DrawFn = (ctx:DrawingContext, displayOptions:DisplayOptions) => void

const layerManager = (() => {
  let layers:{name:string;draw:DrawFn}[] = []
  return {
    register: (name:string, drawFunction:DrawFn) => layers.push({
      name,
      draw: drawFunction
    }),
    clear: () => {
      layers = []
    },
    renderAll: (ctx:DrawingContext, displayOptions:DisplayOptions) => {
      layers.forEach(layer => layer.draw(ctx, displayOptions))
    }
  }
})()

export interface RenderVisualsArgs {
  visuals: { 
    visualGraph:VisualGraph;
    backgroundImage:BackgroundImage, 
    gestures: GestureComponents, 
    guides:Guides, 
    handles:TransformationHandles 
  }
  canvas: HTMLCanvasElement
  displayOptions: DisplayOptions
}

export const renderVisuals = ({visuals, canvas, displayOptions}:RenderVisualsArgs) => {
  const { visualGraph, backgroundImage, gestures, guides, handles } = visuals

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D; // ABK any reason to not be optimistic? this could be null
  ctx.clearRect(0, 0, displayOptions.canvasSize.width, displayOptions.canvasSize.height);

  const visualGestures = new Gestures(visualGraph, gestures)
  const visualGuides = new VisualGuides(visualGraph, guides)

  layerManager.clear()

  layerManager.register('BACKGROUND IMAGE', backgroundImage.draw.bind(backgroundImage))
  layerManager.register('GUIDES ACTUAL POSITION', visualGuides.drawActualPosition.bind(visualGuides))
  layerManager.register('GESTURES', visualGestures.draw.bind(visualGestures))
  layerManager.register('GRAPH', visualGraph.draw.bind(visualGraph))
  layerManager.register('HANDLES', handles.draw.bind(handles))

  layerManager.register('GUIDES SNAP LINES', visualGuides.draw.bind(visualGuides))

  layerManager.renderAll(new CanvasAdaptor(ctx), displayOptions)
}
