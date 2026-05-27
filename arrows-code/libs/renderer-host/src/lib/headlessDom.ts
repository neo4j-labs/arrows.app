import { measureTextWidth } from './textMetrics';

let installed = false;

export function installHeadlessDom(): void {
  if (installed) return;

  const g = globalThis as Record<string, unknown>;
  if (typeof g['document'] === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
    const { JSDOM, VirtualConsole } = require('jsdom') as any;
    // Silence jsdom's "Not implemented: HTMLCanvasElement.prototype.getContext"
    // warning. We shim getContext ourselves below; the original throw is
    // expected and the stderr.
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', (err: unknown) => {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : '';
      if (msg.includes('Not implemented:') && msg.includes('getContext')) return;
      process.stderr.write(`[jsdom] ${msg}\n`);
    });
    const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true, virtualConsole });
    const w = dom.window as unknown as Record<string, unknown>;
    // Some Node 25+ globals (notably `navigator`) are read-only — skip what we can't write.
    for (const key of ['window', 'document', 'XMLSerializer', 'Element', 'HTMLElement', 'SVGElement', 'Node', 'HTMLCanvasElement', 'navigator']) {
      if (typeof g[key] !== 'undefined') continue;
      try { g[key] = w[key]; } catch { /* read-only */ }
    }
  }

  const HCE = g['HTMLCanvasElement'] as { prototype: Record<string, unknown> } | undefined;
  if (HCE && typeof HCE.prototype['getContext'] === 'function') {
    const original = HCE.prototype['getContext'] as (kind: string) => unknown;
    // jsdom throws "Not implemented" without the optional canvas npm pkg — swallow and shim.
    HCE.prototype['getContext'] = function getContext(kind: string) {
      try {
        const real = original.call(this, kind);
        if (real) return real;
      } catch { /* fall through to shim */ }
      return makeShimContext();
    };
  } else if (HCE) {
    HCE.prototype['getContext'] = function () { return makeShimContext(); };
  }

  installed = true;
}

function makeShimContext() {
  let font = '12px sans-serif';
  const noop = () => {};
  return {
    get font() { return font; },
    set font(value: string) { font = value; },
    measureText(text: string) {
      const sizeMatch = /(\d+(?:\.\d+)?)px/.exec(font);
      const size = sizeMatch ? parseFloat(sizeMatch[1]) : 12;
      const weight = /\b(bold|[1-9]00)\b/i.exec(font)?.[1] ?? 'normal';
      const width = measureTextWidth(text, size, weight);
      return {
        width,
        actualBoundingBoxAscent: size * 0.8,
        actualBoundingBoxDescent: size * 0.2,
        actualBoundingBoxLeft: 0,
        actualBoundingBoxRight: width,
        fontBoundingBoxAscent: size * 0.8,
        fontBoundingBoxDescent: size * 0.2,
      } as unknown as TextMetrics;
    },
    fillText: noop, strokeText: noop, save: noop, restore: noop,
    translate: noop, scale: noop, rotate: noop, transform: noop, setTransform: noop, resetTransform: noop,
    beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop,
    arc: noop, arcTo: noop, bezierCurveTo: noop, quadraticCurveTo: noop, ellipse: noop,
    fill: noop, stroke: noop, clip: noop,
    setLineDash: noop, getLineDash: () => [], rect: noop, clearRect: noop, fillRect: noop, strokeRect: noop,
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    createPattern: () => null,
    drawImage: noop,
    putImageData: noop,
    getImageData: () => ({ data: new Uint8ClampedArray(), width: 0, height: 0 }),
    createImageData: () => ({ data: new Uint8ClampedArray(), width: 0, height: 0 }),
  } as unknown as CanvasRenderingContext2D;
}
