import React, { Component } from 'react';
import { renderVisuals } from "../graphics/visualsRenderer";
import {
  DELETE_SELECTION,
  DUPLICATE_SELECTION,
  MOVE_LEFT,
  MOVE_UP,
  MOVE_RIGHT,
  MOVE_DOWN,
  SELECT_ALL,
  UNDO,
  REDO, TOGGLE_FOCUS
} from "../interactions/Keybindings";
import MouseHandler from "../interactions/MouseHandler";
import GraphTextContainer from "../containers/GraphTextContainer";
import { VisualGraph } from '@neo4j-arrows/graphics';
import { DispatchFunction, FixThisType } from '../type-patches';

export interface GraphDisplayProps {
  storage: FixThisType;
  canvasSize: {
    width: number;
    height: number;
  }
  registerAction: (actionName:string, action:(args?:FixThisType) => void) => void;
  duplicateSelection: () => void;
  deleteSelection: () => void;
  selectAll: () => void;
  jumpToNextNode: (direction:string, extraKeys?:string[]) => void;
  tryActivateEditing: () => void;
  undo: () => void;
  redo: () => void;
  visualGraph: VisualGraph;
  backgroundImage: FixThisType;
  selection:FixThisType;
  gestures: FixThisType;
  guides:FixThisType;
  handles:FixThisType;
  toolboxes:FixThisType;
  viewTransformation: FixThisType;
  dispatch: DispatchFunction;
}

class GraphDisplay extends Component<GraphDisplayProps> {
  touchHandler: MouseHandler | undefined;
  canvas: HTMLCanvasElement | null;
  constructor(props:GraphDisplayProps) {
    super(props)

    this.canvas = null;

    props.registerAction(
      DUPLICATE_SELECTION,
      () => props.duplicateSelection()
    )
    props.registerAction(
      DELETE_SELECTION,
      () => props.deleteSelection()
    )
    props.registerAction(
      SELECT_ALL,
      () => props.selectAll()
    )
    props.registerAction(
      MOVE_LEFT,
      (extraKeys) => props.jumpToNextNode('LEFT', extraKeys)
    )
    props.registerAction(
      MOVE_UP,
      (extraKeys) => props.jumpToNextNode('UP', extraKeys)
    )
    props.registerAction(
      MOVE_RIGHT,
      (extraKeys) => props.jumpToNextNode('RIGHT', extraKeys)
    )
    props.registerAction(
      MOVE_DOWN,
      (extraKeys) => props.jumpToNextNode('DOWN', extraKeys)
    )
    props.registerAction(
      TOGGLE_FOCUS,
      () => props.tryActivateEditing()
    )

    this.registerOptionalActions(props)
  }

  registerOptionalActions (props:GraphDisplayProps) {
    const supportsUndo = ['GOOGLE_DRIVE', 'LOCAL_STORAGE'].includes(props.storage.mode)

    props.registerAction(
      UNDO,
      (() => supportsUndo && props.undo()).bind(this)
    )
    props.registerAction(
      REDO,
      (() => supportsUndo && props.redo()).bind(this)
    )
  }

  componentWillReceiveProps(nextProps:GraphDisplayProps, nextContext:any) {
    if(nextProps.storage.mode !== this.props.storage.mode) {
      this.registerOptionalActions(nextProps)
    }
  }

  componentDidMount() {
    if (this.canvas !== null) {
      this.touchHandler = new MouseHandler(this.canvas)
      this.fitCanvasSize(this.canvas, this.props.canvasSize.width, this.props.canvasSize.height)
      this.drawVisuals()
    }
  }

  componentDidUpdate() {
    if (this.canvas !== null) {
      this.fitCanvasSize(this.canvas, this.props.canvasSize.width, this.props.canvasSize.height)
      this.drawVisuals()
    }
  }

  render() {
    return (
      <div style={{
        transform: 'translate(0, 0)'
      }}>
        <canvas style={{
          display: 'block',
          backgroundColor: this.props.visualGraph.style['background-color']
        }} ref={(elm) => this.canvas = elm}/>
        <GraphTextContainer/>
      </div>
    )
  }

  fitCanvasSize(canvas:HTMLCanvasElement, width:number, height:number) {
    canvas.width = width
    canvas.height = height
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    const context = canvas.getContext('2d');

    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = (context !== null) ? 
      (context as any).webkitBackingStorePixelRatio ||
      (context as any).mozBackingStorePixelRatio ||
      (context as any).msBackingStorePixelRatio ||
      (context as any).oBackingStorePixelRatio ||
      (context as any).backingStorePixelRatio || 1
      : 1;
    const ratio = devicePixelRatio / backingStoreRatio

    if (context !== null && devicePixelRatio !== backingStoreRatio) {
      canvas.width = width * ratio
      canvas.height = height * ratio

      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'

      // now scale the context to counter
      // the fact that we've manually scaled
      // our canvas element
      context.scale(ratio, ratio)
    }

    return ratio
  }

  drawVisuals() {
    const { visualGraph, backgroundImage, selection, gestures, guides, handles, toolboxes, viewTransformation, canvasSize } = this.props
    renderVisuals({
      visuals: { visualGraph, backgroundImage, selection, gestures, guides, handles, toolboxes },
      canvas: this.canvas,
      displayOptions: { canvasSize, viewTransformation }
    })

    if (this.touchHandler) this.touchHandler.setDispatch(this.props.dispatch)
  }
}

export default GraphDisplay
