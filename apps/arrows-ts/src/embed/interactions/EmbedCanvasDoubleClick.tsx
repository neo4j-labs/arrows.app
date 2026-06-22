import { useEffect } from 'react';
import { createOrEditAt } from './embedActions';
import { canvasPosOf } from './canvasPos';
import { useAppDispatch } from '../store/store';

// arrows.app's MouseHandler.doubleClick only edits a hit entity - does nothing on empty canvas.
// We intercept dblclick on the canvas (capture phase) and dispatch create-or-edit instead.
export function EmbedCanvasDoubleClick(): null {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const onDblClick = (e: MouseEvent) => {
      const found = canvasPosOf(e);
      if (!found) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      dispatch(createOrEditAt(found.pos));
    };
    document.addEventListener('dblclick', onDblClick, true);
    return () => document.removeEventListener('dblclick', onDblClick, true);
  }, [dispatch]);
  return null;
}
