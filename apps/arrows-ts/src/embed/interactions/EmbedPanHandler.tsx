import { useEffect } from 'react';
import { useStore } from 'react-redux';
import { Vector } from '../../model/Vector';
import { useTool } from '../store/ToolContext';
import { hitTestAt } from './embedActions';
import { computeZoomTransform, cursorFor, decideMouseDown } from './panInteraction';
import { canvasPosOf } from './canvasPos';
import { useAppDispatch } from '../store/store';
// @ts-expect-error JS modules without local typings.
import { getVisualGraph } from '../../selectors';
// @ts-expect-error JS module without local typings.
import { computeCanvasSize, subtractPadding } from '../../model/applicationLayout';

interface BoundingBox { width: number; height: number }
interface ViewportState {
  viewTransformation: { scale: number; offset: { dx: number; dy: number } };
  applicationLayout: unknown;
}

// Pan-tool behaviour: drag empty canvas → pan; over an entity → yield to select;
// wheel anywhere → zoom (treat scroll like pinch).
export function EmbedPanHandler(): null {
  const dispatch = useAppDispatch();
  const store = useStore();
  const ctx = useTool();

  useEffect(() => {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let downCanvas: HTMLCanvasElement | null = null;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const ctx2 = canvasPosOf(e);
      if (!ctx2) return;
      const hit = dispatch(hitTestAt(ctx2.pos));
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
      const hit = dispatch(hitTestAt(ctx2.pos));
      ctx2.canvas.style.cursor = cursorFor(ctx, hit, false);
    };
    const onMouseUp = () => {
      if (!dragging) return;
      dragging = false;
      if (downCanvas) downCanvas.style.cursor = cursorFor(ctx, { kind: 'none' }, false);
      downCanvas = null;
    };

    const onWheel = (e: WheelEvent) => {
      const ctx2 = canvasPosOf(e);
      if (!ctx2) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const state = store.getState() as ViewportState;
      const vt = state.viewTransformation;
      const visualGraph = getVisualGraph(state) as { boundingBox?: () => BoundingBox } | null;
      const bb = visualGraph?.boundingBox?.();
      const canvasSize = subtractPadding(computeCanvasSize(state.applicationLayout));
      const fitScale =
        bb && bb.width > 0 && bb.height > 0
          ? Math.min(canvasSize.width / bb.width, canvasSize.height / bb.height)
          : undefined;
      const out = computeZoomTransform({
        currentScale: vt.scale,
        currentOffset: { dx: vt.offset.dx, dy: vt.offset.dy },
        cursor: { x: ctx2.pos.x, y: ctx2.pos.y },
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
