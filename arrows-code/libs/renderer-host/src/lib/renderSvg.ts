import { installHeadlessDom } from './headlessDom';
import type { Graph } from '@neo4j-arrows/model';

export interface NodeScreenPosition {
  id: string;
  x: number;
  y: number;
}

export interface RenderResult {
  svg: string;
  width: number;
  height: number;
  nodes: NodeScreenPosition[];
}

export async function renderGraphToSvg(graph: Graph): Promise<RenderResult> {
  installHeadlessDom();
  const { renderSvgDom } = await import('@neo4j-arrows/graphics');
  const svgEl = renderSvgDom(graph, {});
  const width = parseFloat(svgEl.getAttribute('width') ?? '0');
  const height = parseFloat(svgEl.getAttribute('height') ?? '0');
  const serializer = new XMLSerializer();
  let svg = serializer.serializeToString(svgEl);
  if (!svg.startsWith('<?xml') && !svg.includes('xmlns=')) {
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const offset = parseOuterTranslate(svg);
  const nodes: NodeScreenPosition[] = graph.nodes.map((node) => ({
    id: node.id,
    x: node.position.x + offset.x,
    y: node.position.y + offset.y,
  }));

  return { svg, width, height, nodes };
}

function parseOuterTranslate(svg: string): { x: number; y: number } {
  const match = /<g transform="translate\((-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\)\s+scale\(1\)"/.exec(svg);
  if (!match) return { x: 0, y: 0 };
  return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
}
