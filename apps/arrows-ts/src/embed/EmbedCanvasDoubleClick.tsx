import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Point } from '../model/Point';
import { createOrEditAt } from './embedActions';

// arrows.app's MouseHandler.doubleClick only edits a hit entity — does nothing on empty canvas.
// We intercept dblclick on the canvas (capture phase) and dispatch create-or-edit instead.
export function EmbedCanvasDoubleClick(): null {
  const dispatch = useDispatch();
  useEffect(() => {
    const onDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.tagName !== 'CANVAS') return;
      const rect = (target as HTMLCanvasElement).getBoundingClientRect();
      const canvasPos = new Point(e.clientX - rect.left, e.clientY - rect.top);
      e.stopImmediatePropagation();
      e.preventDefault();
      dispatch(createOrEditAt(canvasPos) as any);
    };
    document.addEventListener('dblclick', onDblClick, true);
    return () => document.removeEventListener('dblclick', onDblClick, true);
  }, [dispatch]);
  return null;
}
