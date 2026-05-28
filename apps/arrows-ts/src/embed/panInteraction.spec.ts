import { describe, expect, it } from 'vitest';
import { computeZoomTransform, cursorFor, decideMouseDown, resolveToolShortcut } from './panInteraction';
import type { HitResult } from './embedActions';

const empty: HitResult = { kind: 'none' };
const node: HitResult = { kind: 'node', id: 'n0' };
const rel: HitResult = { kind: 'relationship', id: 'r0' };
const ring: HitResult = { kind: 'nodeRing', id: 'n0' };

describe('decideMouseDown — pan vs yield vs ignore', () => {
  it('ignores mousedown when select tool is active and spacebar not held', () => {
    expect(decideMouseDown({ tool: 'select', spaceHeld: false }, empty)).toBe('ignore');
    expect(decideMouseDown({ tool: 'select', spaceHeld: false }, node)).toBe('ignore');
  });

  it('starts a pan drag on empty canvas when pan tool is active', () => {
    expect(decideMouseDown({ tool: 'pan', spaceHeld: false }, empty)).toBe('pan-start');
  });

  it.each([node, rel, ring])('yields to MouseHandler over entity %j so node/ring clicks still work', (hit) => {
    expect(decideMouseDown({ tool: 'pan', spaceHeld: false }, hit)).toBe('yield');
  });

  it('spacebar-held promotes select mode into pan mode', () => {
    expect(decideMouseDown({ tool: 'select', spaceHeld: true }, empty)).toBe('pan-start');
    // ...but still yields over entities (temporary pan, not exclusive).
    expect(decideMouseDown({ tool: 'select', spaceHeld: true }, node)).toBe('yield');
  });
});

describe('resolveToolShortcut — V/H/Space bindings', () => {
  // arrows-ts's TOGGLE_FOCUS keybinding eats plain letters (keyCode 48-90).
  // Capture-phase listener bypasses that; this spec pins V/H/Space mapping.
  it.each([
    [{ key: 'v' }, 'down', { type: 'tool', tool: 'select' }],
    [{ key: 'V' }, 'down', { type: 'tool', tool: 'select' }],
    [{ key: 'h' }, 'down', { type: 'tool', tool: 'pan' }],
    [{ key: 'H' }, 'down', { type: 'tool', tool: 'pan' }],
    [{ code: 'Space' }, 'down', { type: 'space-held', held: true }],
    [{ code: 'Space' }, 'up', { type: 'space-held', held: false }],
    [{ code: 'Space', repeat: true }, 'down', { type: 'none' }], // ignore auto-repeat
    [{ key: 'a' }, 'down', { type: 'none' }],
    [{ key: 'Enter' }, 'down', { type: 'none' }],
  ] as const)('%j (%s) → %j', (input, phase, expected) => {
    expect(resolveToolShortcut(input, phase)).toEqual(expected);
  });
});

describe('computeZoomTransform — free-range zoom independent of canvas-fit', () => {
  const base = { currentScale: 1, currentOffset: { dx: 0, dy: 0 }, cursor: { x: 100, y: 50 } };

  it('scrolls up to zoom in, down to zoom out', () => {
    expect(computeZoomTransform({ ...base, deltaY: -10 }).scale).toBeGreaterThan(1);
    expect(computeZoomTransform({ ...base, deltaY: 10 }).scale).toBeLessThan(1);
  });

  it('clamps to absolute MIN/MAX, not canvas-fit (the bug we fixed)', () => {
    expect(computeZoomTransform({ ...base, currentScale: 0.1, deltaY: 1000 }).scale).toBe(0.05);
    expect(computeZoomTransform({ ...base, currentScale: 4, deltaY: -1000 }).scale).toBe(5);
  });

  it('zooms around the cursor: graph point under cursor stays under cursor', () => {
    const before = { currentScale: 1, currentOffset: { dx: 50, dy: 20 }, cursor: { x: 200, y: 100 }, deltaY: -50 };
    const out = computeZoomTransform(before);
    const gxBefore = (before.cursor.x - before.currentOffset.dx) / before.currentScale;
    const gxAfter = (before.cursor.x - out.offsetX) / out.scale;
    expect(gxAfter).toBeCloseTo(gxBefore, 5);
  });

  it('no-op when deltaY is 0', () => {
    const out = computeZoomTransform({ currentScale: 1.5, currentOffset: { dx: 30, dy: 40 }, cursor: { x: 0, y: 0 }, deltaY: 0 });
    expect(out).toEqual({ scale: 1.5, offsetX: 30, offsetY: 40 });
  });
});

describe('cursorFor — visual hint matches the mousedown action', () => {
  it.each([
    // [ctx, hit, dragging, expected]
    [{ tool: 'select', spaceHeld: false }, empty, false, ''], // arrows owns its cursor
    [{ tool: 'pan', spaceHeld: false }, empty, false, 'grab'],
    [{ tool: 'pan', spaceHeld: false }, empty, true, 'grabbing'],
    [{ tool: 'pan', spaceHeld: false }, node, false, ''], // click selects
    [{ tool: 'pan', spaceHeld: false }, rel, false, ''],
    [{ tool: 'pan', spaceHeld: false }, ring, false, ''], // click drag-to-creates
    [{ tool: 'select', spaceHeld: true }, empty, false, 'grab'],
    [{ tool: 'select', spaceHeld: true }, node, false, ''],
  ] as const)('%j over %j (dragging=%s) → %s', (ctx, hit, dragging, expected) => {
    expect(cursorFor(ctx, hit, dragging)).toBe(expected);
  });
});
