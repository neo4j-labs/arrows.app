import { renderSvgDom } from '@neo4j-arrows/graphics';
import { presentGraphFromState } from './shouldEmit';
// @ts-expect-error JS module without local typings.
import { exportCypher } from '../storage/exportCypher';

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function renderCurrentGraphToSvg(state: unknown): string {
  const s = state as { cachedImages?: Record<string, unknown> };
  const graph = presentGraphFromState(state) as Parameters<typeof renderSvgDom>[0];
  const cachedImages = (s.cachedImages ?? {}) as Parameters<typeof renderSvgDom>[1];
  const svgEl = renderSvgDom(graph, cachedImages);
  let svg = new XMLSerializer().serializeToString(svgEl);
  if (!svg.includes('xmlns=')) {
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  const bg = (graph.style as Record<string, unknown> | undefined)?.['background-color'];
  if (typeof bg === 'string' && bg.trim().length > 0 && bg !== 'transparent' && bg !== 'none') {
    svg = svg.replace(
      /<svg\b([^>]*)>/,
      `<svg$1><rect width="100%" height="100%" fill="${escapeAttr(bg)}"/>`
    );
  }
  return svg;
}

export async function renderCurrentGraphToGraphQL(state: unknown): Promise<string> {
  // @ts-expect-error — JS module without local typings.
  const mod = await import('../graphql/exportGraphQL');
  const exportGraphQL = (mod.default ?? mod) as (g: unknown) => string;
  return exportGraphQL(presentGraphFromState(state));
}

export function renderCurrentGraphToCypher(
  state: unknown,
  keyword: 'CREATE' | 'MERGE' | 'MATCH'
): string {
  return exportCypher(presentGraphFromState(state), keyword, { includeStyling: false }) as string;
}
