import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Point } from '../model/Point';
// @ts-expect-error JS module without .d.ts.
import { mouseDown } from '../actions/mouse';

// arrows.app's MouseHandler treats only Cmd (mac) / Ctrl (others) as the
// multi-select modifier. Users coming from Figma / Excalidraw / Sketch expect
// Shift+click to add to a selection. Intercept Shift+click in capture phase
// and dispatch the existing mouseDown thunk with multiSelectModifierKey=true,
// then stopImmediatePropagation so MouseHandler doesn't fire a second time
// with the wrong modifier state.
export function EmbedShiftMultiSelect(): null {
  const dispatch = useDispatch();

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || !e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (!target || target.tagName !== 'CANVAS') return;
      const rect = (target as HTMLCanvasElement).getBoundingClientRect();
      e.stopImmediatePropagation();
      e.preventDefault();
      (dispatch as any)(mouseDown(new Point(e.clientX - rect.left, e.clientY - rect.top), true));
    };
    document.addEventListener('mousedown', onMouseDown, true);
    return () => document.removeEventListener('mousedown', onMouseDown, true);
  }, [dispatch]);

  return null;
}
