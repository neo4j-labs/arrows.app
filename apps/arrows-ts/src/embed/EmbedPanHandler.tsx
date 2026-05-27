import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { Point } from '../model/Point';
import { Vector } from '../model/Vector';
import { useTool } from './ToolContext';
import { hitTestAt } from './embedActions';
import { computeZoomTransform, cursorFor, decideMouseDown } from './panInteraction';
// @ts-expect-error JS modules without local typings.
import { getVisualGraph } from '../selectors';
// @ts-expect-error
import { computeCanvasSize, subtractPadding } from '../model/applicationLayout';

// Capture-phase canvas handler that owns three behaviors when the pan tool is active:
//   1. Drag on empty canvas → translate viewTransformation; stopImmediatePropagation
//      so arrows' MouseHandler doesn't fire marquee.
//   2. Hovering over a node/relationship: temporarily yield to the select tool —
//      cursor switches to pointer and clicks reach MouseHandler for direct selection.
//      Figma-strict mode would refuse the click; for a graph editor this hybrid is friendlier.
//   3. Wheel = zoom (Figma/Excalidraw convention) regardless of Ctrl. Pinch-zoom
//      already arrives as ctrlKey-true; this just promotes plain scroll too.
export function EmbedPanHandler(): null {
  const dispatch = useDispatch();
  const store = useStore();
  const ctx = useTool();

  useEffect(() => {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let downCanvas: HTMLCanvasElement | null = null;

    const canvasPosOf = (e: MouseEvent | WheelEvent): { canvas: HTMLCanvasElement; pos: Point } | null => {
      const target = e.target as HTMLElement | null;
      if (!target || target.tagName !== 'CANVAS') return null;
      const canvas = target as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      return { canvas, pos: new Point(e.clientX - rect.left, e.clientY - rect.top) };
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const ctx2 = canvasPosOf(e);
      if (!ctx2) return;
      const hit = (dispatch as any)(hitTestAt(ctx2.pos));
      const action = decideMouseDown(ctx, hit);
      if (action === 'ignore' || action === 'yield') return;
      e.stopImmediatePropagation();
      e.preventDefault();
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      downCanvas = ctx2.canvas;
      downCanvas.style.cursor = 'grabbing';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        dispatch({ type: 'SCROLL', vector: new Vector(dx, dy) });
        return;
      }
      const ctx2 = canvasPosOf(e);
      if (!ctx2) return;
      const hit = (dispatch as any)(hitTestAt(ctx2.pos));
      ctx2.canvas.style.cursor = cursorFor(ctx, hit, false);
    };
    const onMouseUp = () => {
      if (!dragging) return;
      dragging = false;
      if (downCanvas) downCanvas.style.cursor = cursorFor(ctx, { kind: 'none' }, false);
      downCanvas = null;
    };

    // Wheel → zoom. Reuse arrows' wheel thunk via the existing dispatch path —
    // forcing ctrlKey=true tells it to zoom rather than pan.
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.tagName !== 'CANVAS') return;
      const rect = (target as HTMLCanvasElement).getBoundingClientRect();
      e.preventDefault();
      e.stopImmediatePropagation();
      const state = store.getState() as any;
      const vt = state.viewTransformation;
      const visualGraph = getVisualGraph(state);
      const bb = visualGraph?.boundingBox?.();
      const canvasSize = subtractPadding(computeCanvasSize(state.applicationLayout));
      const fitScale =
        bb && bb.width > 0 && bb.height > 0
          ? Math.min(canvasSize.width / bb.width, canvasSize.height / bb.height)
          : undefined;
      const out = computeZoomTransform({
        currentScale: vt.scale,
        currentOffset: { dx: vt.offset.dx, dy: vt.offset.dy },
        cursor: { x: e.clientX - rect.left, y: e.clientY - rect.top },
        deltaY: e.deltaY,
        fitScale,
      });
      dispatch({ type: 'ADJUST_VIEWPORT', scale: out.scale, panX: out.offsetX, panY: out.offsetY });
    };

    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('wheel', onWheel, { capture: true, passive: false });
    return () => {
      document.removeEventListener('mousedown', onMouseDown, true);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('wheel', onWheel, true);
    };
  }, [ctx, dispatch, store]);

  useEffect(() => {
    const canvases = document.getElementsByTagName('canvas');
    const cursor = cursorFor(ctx, { kind: 'none' }, false);
    for (let i = 0; i < canvases.length; i++) canvases[i].style.cursor = cursor;
  }, [ctx]);

  return null;
}
