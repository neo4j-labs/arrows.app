import { expect, test, type Page } from '@playwright/test';

declare global {
  interface Window {
    __captured: unknown[];
  }
}

async function loadEmbed(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__captured = [];
    const real = window.parent.postMessage.bind(window.parent);
    window.parent.postMessage = ((msg: unknown, target?: string) => {
      window.__captured.push(msg);
      try { real(msg, target ?? '*'); } catch { /* same-origin self-post; ignore */ }
    }) as typeof window.parent.postMessage;
  });
  await page.goto('/embed.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas');
  await page.waitForFunction(() => {
    const c = document.querySelector('canvas') as HTMLCanvasElement | null;
    return !!c && c.getBoundingClientRect().width > 100;
  }, undefined, { timeout: 15000 });
}

async function sendLoad(page: Page, graph: unknown, docVersion = 1): Promise<void> {
  await page.evaluate(
    ({ g, v }) => window.postMessage({ type: 'load', graph: g, docVersion: v }, '*'),
    { g: graph, v: docVersion },
  );
}

async function waitForGraphChange(page: Page, minCount = 1): Promise<{ graph: { nodes: { position: { x: number; y: number } }[] } }> {
  await page.waitForFunction(
    (n) => window.__captured.filter((m) => (m as { type?: string }).type === 'graph-changed').length >= n,
    minCount,
    { timeout: 5000 },
  );
  const changes = await page.evaluate(() =>
    window.__captured.filter((m) => (m as { type?: string }).type === 'graph-changed')
  );
  return changes[changes.length - 1] as { graph: { nodes: { position: { x: number; y: number } }[] } };
}

test('move node: dragging the node body updates its position', async ({ page }) => {
  await loadEmbed(page);
  await sendLoad(page, {
    style: { 'node-color': '#ffe081', 'font-family': 'sans-serif' },
    nodes: [{ id: 'n0', position: { x: 0, y: 0 }, caption: 'X', labels: [], properties: {}, style: {} }],
    relationships: [],
  });
  await waitForGraphChange(page, 1);

  const target = await page.evaluate(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const r = canvas.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  });

  await page.mouse.move(target.cx, target.cy);
  await page.mouse.down();
  await page.mouse.move(target.cx + 80, target.cy + 40, { steps: 10 });
  await page.mouse.up();

  const change = await waitForGraphChange(page, 2);
  const pos = change.graph.nodes[0].position;
  expect(pos.x !== 0 || pos.y !== 0).toBe(true);
});
