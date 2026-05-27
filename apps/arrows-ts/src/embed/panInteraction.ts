// Pure decision functions for pan tool behavior — keep the DOM-coupled handler
// thin and let the rules be unit-tested.

import type { HitResult } from './embedActions';

export interface PanContext {
  /** Pan tool is the explicit choice (toolbar). */
  tool: 'select' | 'pan';
  /** Spacebar held — temporary pan regardless of tool. */
  spaceHeld: boolean;
}

export type MouseDownAction =
  | 'pan-start'   // begin a viewport-pan drag
  | 'yield'       // pass through to MouseHandler (over an entity)
  | 'ignore';     // not in pan mode, do nothing

export function decideMouseDown(ctx: PanContext, hit: HitResult): MouseDownAction {
  if (ctx.tool !== 'pan' && !ctx.spaceHeld) return 'ignore';
  if (hit.kind !== 'none') return 'yield';
  return 'pan-start';
}

export type CursorHint = '' | 'grab' | 'grabbing' | 'pointer';

export function cursorFor(ctx: PanContext, hit: HitResult, dragging: boolean): CursorHint {
  if (ctx.tool !== 'pan' && !ctx.spaceHeld) return '';
  if (dragging) return 'grabbing';
  if (hit.kind !== 'none') return ''; // default arrow — signal "click selects"
  return 'grab';
}

export type ShortcutAction =
  | { type: 'tool'; tool: 'select' | 'pan' }
  | { type: 'space-held'; held: boolean }
  | { type: 'none' };

/** Resolve a key event into one of the embed's tool-shortcut actions.
 *  Pure so the precedence (V/H/Space) can't silently regress when arrows-ts's
 *  TOGGLE_FOCUS keybinding swallows letters. */
export function resolveToolShortcut(
  event: { key?: string; code?: string; repeat?: boolean },
  phase: 'down' | 'up',
): ShortcutAction {
  if (phase === 'down') {
    if (event.key === 'v' || event.key === 'V') return { type: 'tool', tool: 'select' };
    if (event.key === 'h' || event.key === 'H') return { type: 'tool', tool: 'pan' };
    if (event.code === 'Space' && !event.repeat) return { type: 'space-held', held: true };
  } else if (event.code === 'Space') {
    return { type: 'space-held', held: false };
  }
  return { type: 'none' };
}

export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 5;

export interface ZoomInput {
  currentScale: number;
  currentOffset: { dx: number; dy: number };
  /** Cursor position in canvas coordinates (NOT graph coordinates). */
  cursor: { x: number; y: number };
  /** Wheel deltaY: positive = scroll down = zoom out, negative = scroll up = zoom in. */
  deltaY: number;
  /** Scale at which the graph fits the viewport. The floor never exceeds this
   *  so the user can always zoom out enough to see the entire graph. */
  fitScale?: number;
}

export interface ZoomOutput {
  scale: number;
  offsetX: number;
  offsetY: number;
}

// Free-range cursor-relative zoom that bypasses arrows-ts's "minScale = fit-to-canvas" clamp.
// Invariant: the graph point under the cursor stays under the cursor.
export function computeZoomTransform(input: ZoomInput): ZoomOutput {
  const factor = (100 - input.deltaY) / 100;
  const targetScale = input.currentScale * factor;
  const fitFloor = input.fitScale ?? MIN_ZOOM;
  const minScale = Math.min(MIN_ZOOM, fitFloor);
  const scale = Math.min(MAX_ZOOM, Math.max(minScale, targetScale));
  // Solve for offset so cursor maps to the same graph point at the new scale.
  const graphX = (input.cursor.x - input.currentOffset.dx) / input.currentScale;
  const graphY = (input.cursor.y - input.currentOffset.dy) / input.currentScale;
  return {
    scale,
    offsetX: input.cursor.x - graphX * scale,
    offsetY: input.cursor.y - graphY * scale,
  };
}

