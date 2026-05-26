/**
 * UI tests for the arrows-ts embed running in a real Chromium.
 *
 * Strategy: each test installs an init script that captures every outbound
 * `window.parent.postMessage` (which is how the bridge talks to its host).
 * The bridge can't tell whether it's running inside the VS Code webview or
 * a Playwright iframe, so the same code path executes either way.
 */
import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __captured: unknown[];
  }
}

const INIT_CAPTURE = () => {
  (window as unknown as { __captured: unknown[] }).__captured = [];
  const real = window.parent.postMessage.bind(window.parent);
  // The bridge calls window.parent.postMessage; intercept and shadow into
  // a window-side array we can inspect from the test runner.
  Object.defineProperty(window.parent, 'postMessage', {
    value: (msg: unknown, target?: string) => {
      (window as unknown as { __captured: unknown[] }).__captured.push(msg);
      try {
        real(msg, target ?? '*');
      } catch {
        // top-level page: posting to "parent" == posting to self; ignore
      }
    },
    configurable: true,
  });
};

const fixtureGraph = () => ({
  style: { 'node-color': '#ffe081', 'font-family': 'sans-serif' },
  nodes: [
    { id: 'n0', position: { x: 0, y: 0 }, caption: 'Alice', labels: ['Person'], properties: { name: "'Alice'" }, style: {} },
    { id: 'n1', position: { x: 240, y: 0 }, caption: 'Bob', labels: ['Person'], properties: { name: "'Bob'", greeting: '$greeting' }, style: {} },
  ],
  relationships: [
    { id: 'r0', fromId: 'n0', toId: 'n1', type: 'KNOWS', properties: {}, style: {} },
  ],
});

async function loadEmbed(page: Page): Promise<void> {
  await page.addInitScript(INIT_CAPTURE);
  await page.goto('/embed.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas');
  await page.waitForFunction(() =>
    Array.isArray((window as unknown as { __captured: unknown[] }).__captured) &&
    (window as unknown as { __captured: unknown[] }).__captured.length > 0,
  );
  await page.waitForFunction(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (!c) return false;
    const r = c.getBoundingClientRect();
    return r.width > 100 && r.height > 100;
  }, undefined, { timeout: 15000 });
}

async function sendLoad(page: Page, graph: unknown, docVersion = 1): Promise<void> {
  await page.evaluate(
    ({ g, v }) => window.postMessage({ type: 'load', graph: g, docVersion: v }, '*'),
    { g: graph, v: docVersion },
  );
}

async function captured(page: Page): Promise<unknown[]> {
  return page.evaluate(() => (window as unknown as { __captured: unknown[] }).__captured);
}

async function waitForGraphChange(page: Page, minCount = 1): Promise<unknown> {
  await page.waitForFunction(
    (n) =>
      ((window as unknown as { __captured: { type: string; graph?: unknown }[] }).__captured)
        .filter((m) => m.type === 'graph-changed').length >= n,
    minCount,
    { timeout: 5000 },
  );
  const all = await captured(page);
  const changes = (all as { type: string }[]).filter((m) => m.type === 'graph-changed');
  return changes[changes.length - 1];
}

// ---------------------------------------------------------------------------

test('loading a partial-style graph emits no substring crash', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await loadEmbed(page);
  await sendLoad(page, fixtureGraph());
  await waitForGraphChange(page, 1);
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('embed loads and posts a ready message', async ({ page }) => {
  await loadEmbed(page);
  const msgs = await captured(page);
  const types = (msgs as { type: string }[]).map((m) => m.type);
  expect(types).toContain('ready');
});

test('visualize: load a graph, bridge echoes graph-changed with same nodes', async ({ page }) => {
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text()); });
  await loadEmbed(page);
  console.log('captured after load:', await captured(page));
  await sendLoad(page, fixtureGraph());
  const change = (await waitForGraphChange(page, 1)) as { graph: { nodes: unknown[]; relationships: unknown[] } };
  expect(change.graph.nodes).toHaveLength(2);
  expect(change.graph.relationships).toHaveLength(1);
  expect((change.graph.nodes[0] as { caption: string }).caption).toBe('Alice');
});

test('parameter values round-trip unchanged', async ({ page }) => {
  await loadEmbed(page);
  await sendLoad(page, fixtureGraph());
  const change = (await waitForGraphChange(page, 1)) as { graph: { nodes: { properties: Record<string, string> }[] } };
  // Bob has a property `greeting: '$greeting'`.
  expect(change.graph.nodes[1].properties.greeting).toBe('$greeting');
});

test('multi-node graph: all node captions reach the bridge echo unchanged', async ({ page }) => {
  await loadEmbed(page);
  await sendLoad(page, {
    style: { 'node-color': '#ffe081', 'font-family': 'sans-serif' },
    nodes: [
      { id: 'a', position: { x: 0, y: 0 }, caption: 'A', labels: ['L'], properties: {}, style: {} },
      { id: 'b', position: { x: 100, y: 0 }, caption: 'B', labels: ['L'], properties: {}, style: {} },
      { id: 'c', position: { x: 200, y: 0 }, caption: 'C', labels: ['L'], properties: {}, style: {} },
    ],
    relationships: [
      { id: 'r1', fromId: 'a', toId: 'b', type: 'R', properties: {}, style: {} },
      { id: 'r2', fromId: 'b', toId: 'c', type: 'R', properties: {}, style: {} },
    ],
  });
  const change = (await waitForGraphChange(page, 1)) as {
    graph: { nodes: { caption: string }[]; relationships: unknown[] };
  };
  expect(change.graph.nodes.map((n) => n.caption)).toEqual(['A', 'B', 'C']);
  expect(change.graph.relationships).toHaveLength(2);
});

test('graph style round-trips through the embed', async ({ page }) => {
  await loadEmbed(page);
  await sendLoad(page, {
    style: { 'node-color': '#ff0000', 'background-color': '#000000' },
    nodes: [
      { id: 'n0', position: { x: 0, y: 0 }, caption: 'x', labels: [], properties: {}, style: {} },
      { id: 'n1', position: { x: 100, y: 0 }, caption: 'y', labels: [], properties: {}, style: {} },
    ],
    relationships: [],
  });
  const change = (await waitForGraphChange(page, 1)) as {
    graph: { style: Record<string, string> };
  };
  expect(change.graph.style['node-color']).toBe('#ff0000');
  expect(change.graph.style['background-color']).toBe('#000000');
});

// NOTE: ring-drag pixel coords are approximate; arrows-ts decides whether the
// gesture creates a node or pans the viewport based on tight radius bands we
// don't know exactly in headless. Re-enable after we expose a way to read
// `node.radius` from the visualGraph for the test.
test.skip('create node: drag from a node ring to empty canvas spawns a node + relationship', async ({ page }) => {
  await loadEmbed(page);
  await sendLoad(page, {
    style: { 'node-color': '#ffe081', 'font-family': 'sans-serif' },
    nodes: [{ id: 'n0', position: { x: 0, y: 0 }, caption: 'Start', labels: [], properties: {}, style: {} }],
    relationships: [],
  });
  await waitForGraphChange(page, 1);
  await page.waitForFunction(() => {
    const c = document.querySelector('canvas');
    return !!c && (c as HTMLCanvasElement).getBoundingClientRect().width > 100;
  });

  // Compute screen pixel of n0 + the ring offset that triggers NODE_RING drag.
  // We approximate: graph-space (0,0) sits at the viewport centre after the
  // embed's auto-fit. A node has radius ~25 — drag from radius+8 (ring) outward
  // to a clearly empty zone.
  const target = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const r = canvas.getBoundingClientRect();
    return {
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
      empty: { x: r.left + r.width * 0.8, y: r.top + r.height * 0.5 },
      ring: 33, // approx node-radius + halo
    };
  });

  await page.mouse.move(target.cx + target.ring, target.cy);
  await page.mouse.down();
  await page.mouse.move(target.empty.x, target.empty.y, { steps: 10 });
  await page.mouse.up();

  const change = (await waitForGraphChange(page, 2)) as { graph: { nodes: unknown[]; relationships: unknown[] } };
  expect(change.graph.nodes.length).toBeGreaterThanOrEqual(2);
  expect(change.graph.relationships.length).toBeGreaterThanOrEqual(1);
});

test('move node: dragging the node body updates its position', async ({ page }) => {
  await loadEmbed(page);
  await sendLoad(page, {
    style: { 'node-color': '#ffe081', 'font-family': 'sans-serif' },
    nodes: [{ id: 'n0', position: { x: 0, y: 0 }, caption: 'X', labels: [], properties: {}, style: {} }],
    relationships: [],
  });
  await waitForGraphChange(page, 1);

  // After load the canvas may briefly remount; wait until it's back.
  await page.waitForFunction(() => {
    const c = document.querySelector('canvas');
    return !!c && (c as HTMLCanvasElement).getBoundingClientRect().width > 100;
  });

  const target = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const r = canvas.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  });

  await page.mouse.move(target.cx, target.cy);
  await page.mouse.down();
  await page.mouse.move(target.cx + 80, target.cy + 40, { steps: 10 });
  await page.mouse.up();

  const change = (await waitForGraphChange(page, 2)) as { graph: { nodes: { position: { x: number; y: number } }[] } };
  const pos = change.graph.nodes[0].position;
  // Drag started from canvas centre and moved by (+80, +40) screen px. The node
  // was loaded at (0,0) — any move means at least one coord becomes non-zero.
  expect(pos.x !== 0 || pos.y !== 0).toBe(true);
});
