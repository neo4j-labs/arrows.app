import { useEffect } from 'react';
// @ts-expect-error JS module without .d.ts.
import { ignoreTarget } from '../interactions/Keybindings';
import { useTool } from './ToolContext';
import { resolveToolShortcut } from './panInteraction';

// V → select tool, H → pan tool (Figma convention). Space temporarily activates pan.
// Must run in capture phase: arrows-ts's TOGGLE_FOCUS keybinding eats every plain
// letter (keyCode range 48-90) via preventDefault/stopPropagation in the bubble phase,
// which would block V/H entirely. Capturing on window beats arrows' window-bubble handler.
// Ignored when an input/textarea is focused so users can type "h" or "v" in inspector fields.
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
