import { useEffect } from 'react';
import { canvasPosOf } from './canvasPos';
import { useAppDispatch } from '../store/store';
// @ts-expect-error JS module without .d.ts.
import { mouseDown } from '../../actions/mouse';

// Adds Shift+click as a multi-select modifier (web app only respects Cmd/Ctrl).
// Capture-phase so MouseHandler doesn't fire a second time with the wrong state.
export function EmbedShiftMultiSelect(): null {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || !e.shiftKey) return;
      const found = canvasPosOf(e);
      if (!found) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      dispatch(mouseDown(found.pos, true));
    };
    document.addEventListener('mousedown', onMouseDown, true);
    return () => document.removeEventListener('mousedown', onMouseDown, true);
  }, [dispatch]);

  return null;
}
