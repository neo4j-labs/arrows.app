import type { Graph, Node, Relationship } from '@neo4j-arrows/model';

interface SerializedNode {
  caption: string;
  id: string;
  labels: string[];
  position: { x: number; y: number };
  properties: Record<string, string>;
  style: Record<string, string>;
}

interface SerializedRelationship {
  fromId: string;
  id: string;
  properties: Record<string, string>;
  style: Record<string, string>;
  toId: string;
  type: string;
}

interface SerializedGraph {
  nodes: SerializedNode[];
  relationships: SerializedRelationship[];
  style: Record<string, string>;
}

export function writeGraph(graph: Graph): string {
  const serialized: SerializedGraph = {
    nodes: graph.nodes.map(serializeNode),
    relationships: graph.relationships.map(serializeRelationship),
    style: sortKeys(graph.style as Record<string, string>),
  };
  return JSON.stringify(serialized, null, 2);
}

function serializeNode(node: Node): SerializedNode {
  return {
    caption: node.caption,
    id: node.id,
    labels: [...node.labels],
    position: { x: node.position.x, y: node.position.y },
    properties: sortKeys(node.properties),
    style: sortKeys(node.style),
  };
}

function serializeRelationship(rel: Relationship): SerializedRelationship {
  return {
    fromId: rel.fromId,
    id: rel.id,
    properties: sortKeys(rel.properties),
    style: sortKeys(rel.style),
    toId: rel.toId,
    type: rel.type,
  };
}

function sortKeys<T extends Record<string, string>>(obj: T): T {
  const sorted: Record<string, string> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = obj[key];
  }
  return sorted as T;
}
