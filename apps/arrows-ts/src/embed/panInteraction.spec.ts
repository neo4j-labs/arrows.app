import { describe, expect, it } from 'vitest';
import { computeZoomTransform, cursorFor, decideMouseDown, resolveToolShortcut } from './panInteraction';
import type { HitResult } from './embedActions';

const empty: HitResult = { kind: 'none' };
const node: HitResult = { kind: 'node', id: 'n0' };
const rel: HitResult = { kind: 'relationship', id: 'r0' };

describe('decideMouseDown — pan vs yield vs ignore', () => {
  it('ignores mousedown when select tool is active and spacebar not held', () => {
    expect(decideMouseDown({ tool: 'select', spaceHeld: false }, empty)).toBe('ignore');
    expect(decideMouseDown({ tool: 'select', spaceHeld: false }, node)).toBe('ignore');
  });

  it('starts a pan drag on empty canvas when pan tool is active', () => {
    expect(decideMouseDown({ tool: 'pan', spaceHeld: false }, empty)).toBe('pan-start');
  });

  it('yields to MouseHandler when in pan mode but cursor is over a node', () => {
    // User wants to click a node directly without toggling tools first.
    expect(decideMouseDown({ tool: 'pan', spaceHeld: false }, node)).toBe('yield');
  });

  it('yields to MouseHandler when in pan mode but cursor is over a relationship', () => {
    expect(decideMouseDown({ tool: 'pan', spaceHeld: false }, rel)).toBe('yield');
  });

  it('yields when in pan mode and cursor is over a node-ring (drag-to-create handle)', () => {
    // The ring around a node is the drag-to-create gesture target. Pan must
    // yield there or the user can't pull a new relationship out of a node.
    const ring: HitResult = { kind: 'nodeRing', id: 'n0' };
    expect(decideMouseDown({ tool: 'pan', spaceHeld: false }, ring)).toBe('yield');
  });

  it('spacebar-held promotes select mode into pan mode', () => {
    expect(decideMouseDown({ tool: 'select', spaceHeld: true }, empty)).toBe('pan-start');
  });

  it('spacebar-held still yields over entities (temporary pan, not exclusive)', () => {
    expect(decideMouseDown({ tool: 'select', spaceHeld: true }, node)).toBe('yield');
  });
});

describe('resolveToolShortcut — V/H/Space bindings', () => {
  // Regression net: arrows-ts's TOGGLE_FOCUS keybinding fires on any letter
  // (keyCode 48-90) via preventDefault, which would eat V/H. Capture-phase
  // listener bypasses that; this test pins the V/H/Space mapping so it stays
  // correct even if we shuffle where the listener attaches.

  it('V (lowercase) selects the Select tool', () => {
    expect(resolveToolShortcut({ key: 'v' }, 'down')).toEqual({ type: 'tool', tool: 'select' });
  });

  it('V (uppercase, shift-held) selects the Select tool', () => {
    expect(resolveToolShortcut({ key: 'V' }, 'down')).toEqual({ type: 'tool', tool: 'select' });
  });

  it('H selects the Pan tool', () => {
    expect(resolveToolShortcut({ key: 'h' }, 'down')).toEqual({ type: 'tool', tool: 'pan' });
    expect(resolveToolShortcut({ key: 'H' }, 'down')).toEqual({ type: 'tool', tool: 'pan' });
  });

  it('Space keydown sets space-held true', () => {
    expect(resolveToolShortcut({ code: 'Space' }, 'down')).toEqual({ type: 'space-held', held: true });
  });

  it('Space keyup clears space-held', () => {
    expect(resolveToolShortcut({ code: 'Space' }, 'up')).toEqual({ type: 'space-held', held: false });
  });

  it('ignores Space auto-repeat (only the first keydown matters)', () => {
    expect(resolveToolShortcut({ code: 'Space', repeat: true }, 'down')).toEqual({ type: 'none' });
  });

  it('returns none for unrelated keys', () => {
    expect(resolveToolShortcut({ key: 'a' }, 'down')).toEqual({ type: 'none' });
    expect(resolveToolShortcut({ key: 'Enter' }, 'down')).toEqual({ type: 'none' });
  });
});

describe('computeZoomTransform — free-range zoom independent of canvas-fit', () => {
  // The user reported: "max zoom out depends on canvas size — zoom out maxes out."
  // arrows-ts's wheel thunk clamps minScale to Math.min(1, fitW, fitH). We replace
  // that with a free [MIN, MAX] range so users can zoom out further than the graph fits.

  it('zoom in: scale > current when deltaY < 0 (scroll up)', () => {
    const out = computeZoomTransform({
      currentScale: 1,
      currentOffset: { dx: 0, dy: 0 },
      cursor: { x: 100, y: 50 },
      deltaY: -10,
    });
    expect(out.scale).toBeGreaterThan(1);
  });

  it('zoom out: scale < current when deltaY > 0 (scroll down)', () => {
    const out = computeZoomTransform({
      currentScale: 1,
      currentOffset: { dx: 0, dy: 0 },
      cursor: { x: 100, y: 50 },
      deltaY: 10,
    });
    expect(out.scale).toBeLessThan(1);
  });

  it('clamps zoom-out to the absolute minimum, NOT to the canvas-fit minimum', () => {
    // The whole point of the fix: even with a single tiny graph and a big canvas,
    // the user must be able to zoom further out than fit-to-canvas allows.
    const out = computeZoomTransform({
      currentScale: 0.1,
      currentOffset: { dx: 0, dy: 0 },
      cursor: { x: 100, y: 50 },
      deltaY: 1000,
    });
    expect(out.scale).toBe(0.05);
  });

  it('clamps zoom-in to the absolute maximum', () => {
    const out = computeZoomTransform({
      currentScale: 4,
      currentOffset: { dx: 0, dy: 0 },
      cursor: { x: 0, y: 0 },
      deltaY: -1000,
    });
    expect(out.scale).toBe(5);
  });

  it('zooms around the cursor: the graph point under the cursor stays under the cursor', () => {
    // Invariant: graphPoint = (cursor - offset) / scale must be invariant.
    const before = { currentScale: 1, currentOffset: { dx: 50, dy: 20 }, cursor: { x: 200, y: 100 }, deltaY: -50 };
    const out = computeZoomTransform(before);

    const graphXBefore = (before.cursor.x - before.currentOffset.dx) / before.currentScale;
    const graphYBefore = (before.cursor.y - before.currentOffset.dy) / before.currentScale;
    const graphXAfter = (before.cursor.x - out.offsetX) / out.scale;
    const graphYAfter = (before.cursor.y - out.offsetY) / out.scale;
    expect(graphXAfter).toBeCloseTo(graphXBefore, 5);
    expect(graphYAfter).toBeCloseTo(graphYBefore, 5);
  });

  it('no-op when deltaY is 0', () => {
    const out = computeZoomTransform({
      currentScale: 1.5,
      currentOffset: { dx: 30, dy: 40 },
      cursor: { x: 0, y: 0 },
      deltaY: 0,
    });
    expect(out.scale).toBe(1.5);
    expect(out.offsetX).toBe(30);
    expect(out.offsetY).toBe(40);
  });
});

describe('cursorFor — visual hint matches the action that mousedown would take', () => {
  it('blank when neither pan nor space — let arrows render its own cursor', () => {
    expect(cursorFor({ tool: 'select', spaceHeld: false }, empty, false)).toBe('');
  });

  it('grab over empty canvas in pan mode (drag will pan)', () => {
    expect(cursorFor({ tool: 'pan', spaceHeld: false }, empty, false)).toBe('grab');
  });

  it('grabbing during an active pan drag', () => {
    expect(cursorFor({ tool: 'pan', spaceHeld: false }, empty, true)).toBe('grabbing');
  });

  it('default arrow over an entity in pan mode (click will select)', () => {
    expect(cursorFor({ tool: 'pan', spaceHeld: false }, node, false)).toBe('');
    expect(cursorFor({ tool: 'pan', spaceHeld: false }, rel, false)).toBe('');
  });

  it('default arrow over a node-ring too — signal that clicking will drag-to-create', () => {
    const ring: HitResult = { kind: 'nodeRing', id: 'n0' };
    expect(cursorFor({ tool: 'pan', spaceHeld: false }, ring, false)).toBe('');
  });

  it('spacebar-held behaves like pan tool for cursor', () => {
    expect(cursorFor({ tool: 'select', spaceHeld: true }, empty, false)).toBe('grab');
    expect(cursorFor({ tool: 'select', spaceHeld: true }, node, false)).toBe('');
  });
});
