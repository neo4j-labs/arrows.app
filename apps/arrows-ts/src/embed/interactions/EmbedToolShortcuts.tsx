import { useEffect } from 'react';
// @ts-expect-error JS module without .d.ts.
import { ignoreTarget } from '../../interactions/Keybindings';
import { useTool } from '../store/ToolContext';
import { resolveToolShortcut } from './panInteraction';

// V → select, H → pan, Space → temporary pan. Capture phase because arrows.app's
// TOGGLE_FOCUS bubble handler would otherwise swallow the letter.
export function EmbedToolShortcuts(): null {
  const { setTool, setSpaceHeld } = useTool();
  useEffect(() => {
    const handle = (e: KeyboardEvent, phase: 'down' | 'up'): void => {
      if (ignoreTarget(e)) return;
      const action = resolveToolShortcut(e, phase);
      if (action.type === 'none') return;
      e.preventDefault();
      e.stopPropagation();
      if (action.type === 'tool') setTool(action.tool);
      else setSpaceHeld(action.held);
    };
    const onKeyDown = (e: KeyboardEvent) => handle(e, 'down');
    const onKeyUp = (e: KeyboardEvent) => handle(e, 'up');
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
    };
  }, [setTool, setSpaceHeld]);
  return null;
}
