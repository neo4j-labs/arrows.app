import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { Point } from '../model/Point';
import { Vector } from '../model/Vector';
// @ts-expect-error JS modules without .d.ts.
import { mouseMove } from '../actions/mouse';

// arrows.app's MouseHandler ends a drag on canvas mouseleave (handleMouseLeave →
// endDrag). The user expects Figma-style behavior: the drag continues regardless
// of cursor position, and the canvas auto-pans to chase the cursor.
//
// We do two things here:
//  1. Capture-phase mouseleave on the canvas: if a drag is in flight, stop the
//     event before MouseHandler sees it, so endDrag never fires.
//  2. Document-level mousemove during a drag: forward to the same mouseMove
//     thunk MouseHandler would call, mapping clientX/Y to canvas coords.
//  3. When the cursor is past the canvas edge, also dispatch SCROLL toward the
//     cursor so the viewport follows.
const EDGE_PAN_SPEED = 0.4; // multiplier on how-far-past-edge → pan per frame

export function EmbedDragContinuation(): null {
  const dispatch = useDispatch();
  const store = useStore();

  useEffect(() => {
    const isDragging = (): boolean => {
      const dt = (store.getState() as any).mouse?.dragType;
      return !!dt && dt !== 'NONE';
    };

    const firstCanvas = (): HTMLCanvasElement | null =>
      document.getElementsByTagName('canvas')[0] ?? null;

    const onMouseLeave = (e: MouseEvent) => {
      if (!isDragging()) return;
      e.stopImmediatePropagation();
      e.preventDefault();
    };

    const onMouseMoveAnywhere = (e: MouseEvent) => {
      if (!isDragging()) return;
      const canvas = firstCanvas();
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const canvasPos = new Point(e.clientX - rect.left, e.clientY - rect.top);
      // Forward to arrows' mouseMove so node/handle tracking continues.
      (dispatch as any)(mouseMove(canvasPos));

      // Edge-pan: if cursor is outside the canvas, scroll the viewport toward it.
      let dx = 0;
      let dy = 0;
      if (e.clientX < rect.left) dx = e.clientX - rect.left;
      else if (e.clientX > rect.right) dx = e.clientX - rect.right;
      if (e.clientY < rect.top) dy = e.clientY - rect.top;
      else if (e.clientY > rect.bottom) dy = e.clientY - rect.bottom;
      if (dx !== 0 || dy !== 0) {
        // SCROLL translates by the given vector — invert sign so cursor stays under node.
        dispatch({ type: 'SCROLL', vector: new Vector(-dx * EDGE_PAN_SPEED, -dy * EDGE_PAN_SPEED) });
      }
    };

    // Bind mouseleave on the canvas in capture phase so we intercept before MouseHandler.
    const canvas = firstCanvas();
    if (canvas) canvas.addEventListener('mouseleave', onMouseLeave, true);
    // Also bind any future canvases by re-checking on each move.
    document.addEventListener('mousemove', onMouseMoveAnywhere);

    return () => {
      if (canvas) canvas.removeEventListener('mouseleave', onMouseLeave, true);
      document.removeEventListener('mousemove', onMouseMoveAnywhere);
    };
  }, [dispatch, store]);

  return null;
}
