import { useEffect } from 'react';
import { useStore } from 'react-redux';
import { Point } from '../model/Point';
import { Vector } from '../model/Vector';
import { firstCanvas } from './canvasPos';
import { useAppDispatch } from './store';
// @ts-expect-error JS module without .d.ts.
import { mouseMove } from '../actions/mouse';

// Suppresses arrows.app's mouseleave-ends-drag so drags continue off-canvas,
// and auto-pans the viewport when the cursor is past the edge.
const EDGE_PAN_SPEED = 0.4;

export function EmbedDragContinuation(): null {
  const dispatch = useAppDispatch();
  const store = useStore();

  useEffect(() => {
    const isDragging = (): boolean => {
      const dt = (store.getState() as { mouse?: { dragType?: string } }).mouse?.dragType;
      return !!dt && dt !== 'NONE';
    };

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
      dispatch(mouseMove(canvasPos));

      let dx = 0;
      let dy = 0;
      if (e.clientX < rect.left) dx = e.clientX - rect.left;
      else if (e.clientX > rect.right) dx = e.clientX - rect.right;
      if (e.clientY < rect.top) dy = e.clientY - rect.top;
      else if (e.clientY > rect.bottom) dy = e.clientY - rect.bottom;
      if (dx !== 0 || dy !== 0) {
        dispatch({ type: 'SCROLL', vector: new Vector(-dx * EDGE_PAN_SPEED, -dy * EDGE_PAN_SPEED) });
      }
    };

    const canvas = firstCanvas();
    if (canvas) canvas.addEventListener('mouseleave', onMouseLeave, true);
    document.addEventListener('mousemove', onMouseMoveAnywhere);

    return () => {
      if (canvas) canvas.removeEventListener('mouseleave', onMouseLeave, true);
      document.removeEventListener('mousemove', onMouseMoveAnywhere);
    };
  }, [dispatch, store]);

  return null;
}
