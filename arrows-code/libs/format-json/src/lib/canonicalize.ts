import type { Graph } from '@neo4j-arrows/model';

export function canonicalize(graph: Graph): Graph {
  return {
    nodes: [...graph.nodes].sort((a, b) => a.id.localeCompare(b.id)),
    relationships: [...graph.relationships].sort((a, b) => a.id.localeCompare(b.id)),
    style: graph.style,
  };
}
