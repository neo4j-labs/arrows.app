import { renderSvgDom } from '@neo4j-arrows/graphics';
import { presentGraphFromState } from './shouldEmit';
// @ts-expect-error JS module without local typings.
import { exportCypher } from '../storage/exportCypher';

export type RenderKind = 'svg' | 'graphql' | 'cypher';
export type Renderer = (state: unknown, payload?: unknown) => string | Promise<string>;

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function renderSvg(state: unknown): string {
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

async function renderGraphQL(state: unknown): Promise<string> {
  // @ts-expect-error JS module without local typings.
  const mod = await import('../graphql/exportGraphQL');
  const exportGraphQL = (mod.default ?? mod) as (g: unknown) => string;
  return exportGraphQL(presentGraphFromState(state));
}

function renderCypher(state: unknown, payload?: unknown): string {
  const keyword =
    (payload as { keyword?: 'CREATE' | 'MERGE' | 'MATCH' } | undefined)?.keyword ?? 'CREATE';
  return exportCypher(presentGraphFromState(state), keyword, { includeStyling: false }) as string;
}

export const renderers: Record<RenderKind, Renderer> = {
  svg: renderSvg,
  graphql: renderGraphQL,
  cypher: renderCypher,
};
