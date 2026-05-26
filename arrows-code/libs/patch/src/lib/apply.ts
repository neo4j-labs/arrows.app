import {
  Point,
  addLabel as addLabelOnNode,
  moveTo,
  removeLabel as removeLabelOnNode,
  renameLabel as renameLabelOnNode,
  setCaption as setCaptionOnNode,
  setType as setTypeOnRel,
} from '@neo4j-arrows/model';
import type { Graph, Node, Relationship } from '@neo4j-arrows/model';
import type { PatchError, PatchOp, PatchResult } from './types';

/**
 * Apply one or more PatchOps to a graph. Pure: never mutates input.
 *
 * Where arrows already exposes a pure entity helper in @neo4j-arrows/model,
 * we delegate to it rather than re-implement the spread. The patch lib's
 * remaining job is op routing, validation, and graph-level concerns
 * (adding/removing nodes/rels, graph-wide renames).
 */
export function apply(graph: Graph, ops: PatchOp | PatchOp[]): PatchResult {
  const list = Array.isArray(ops) ? ops : [ops];
  let current = graph;
  const errors: PatchError[] = [];

  for (const op of list) {
    try {
      current = applyOne(current, op);
    } catch (error) {
      errors.push({
        op,
        code: 'patch.apply-error',
        message: error instanceof Error ? error.message : 'unknown patch error',
      });
    }
  }

  return { graph: current, errors };
}

function applyOne(graph: Graph, op: PatchOp): Graph {
  switch (op.type) {
    case 'addNode': {
      if (graph.nodes.some((n) => n.id === op.id)) {
        throw new Error(`Node ${op.id} already exists`);
      }
      const node: Node = {
        entityType: 'Node',
        id: op.id,
        position: new Point(op.x, op.y),
        caption: op.caption ?? '',
        labels: op.labels ?? [],
        properties: op.properties ?? {},
        style: op.style ?? {},
      };
      return { ...graph, nodes: [...graph.nodes, node] };
    }
    case 'removeNode': {
      const nodes = graph.nodes.filter((n) => n.id !== op.id);
      const relationships = graph.relationships.filter((r) => r.fromId !== op.id && r.toId !== op.id);
      return { ...graph, nodes, relationships };
    }
    case 'movePos':
      return mapNode(graph, op.id, (n) => moveTo(n, new Point(n.position.x + op.dx, n.position.y + op.dy)));
    case 'setPos':
      return mapNode(graph, op.id, (n) => moveTo(n, new Point(op.x, op.y)));
    case 'setCaption':
      return mapNode(graph, op.id, (n) => setCaptionOnNode(n, op.caption));
    case 'addLabel':
      return mapNode(graph, op.id, (n) => addLabelOnNode(n, op.label));
    case 'removeLabel':
      return mapNode(graph, op.id, (n) => removeLabelOnNode(n, op.label));
    case 'renameLabel':
      return { ...graph, nodes: graph.nodes.map((n) => renameLabelOnNode(n, op.oldLabel, op.newLabel)) };
    case 'setProperty':
      return mapEntity(graph, op.id, (e) => ({ ...e, properties: { ...e.properties, [op.key]: op.value } }));
    case 'removeProperty':
      return mapEntity(graph, op.id, (e) => {
        const { [op.key]: _omit, ...rest } = e.properties;
        return { ...e, properties: rest };
      });
    case 'setStyle': {
      if (op.id === null) {
        return { ...graph, style: { ...graph.style, [op.key]: op.value } };
      }
      return mapEntity(graph, op.id, (e) => ({ ...e, style: { ...e.style, [op.key]: op.value } }));
    }
    case 'addRelationship': {
      if (graph.relationships.some((r) => r.id === op.id)) {
        throw new Error(`Relationship ${op.id} already exists`);
      }
      if (!graph.nodes.some((n) => n.id === op.fromId)) {
        throw new Error(`Relationship fromId ${op.fromId} not found`);
      }
      if (!graph.nodes.some((n) => n.id === op.toId)) {
        throw new Error(`Relationship toId ${op.toId} not found`);
      }
      const rel: Relationship = {
        entityType: 'Relationship',
        id: op.id,
        fromId: op.fromId,
        toId: op.toId,
        type: op.relType,
        properties: op.properties ?? {},
        style: op.style ?? {},
      };
      return { ...graph, relationships: [...graph.relationships, rel] };
    }
    case 'removeRelationship':
      return { ...graph, relationships: graph.relationships.filter((r) => r.id !== op.id) };
    case 'setRelType':
      return mapRel(graph, op.id, (r) => setTypeOnRel(r, op.relType));
    case 'renameRelType':
      return {
        ...graph,
        relationships: graph.relationships.map((r) => (r.type === op.oldType ? setTypeOnRel(r, op.newType) : r)),
      };
  }
}

function mapNode(graph: Graph, id: string, fn: (n: Node) => Node): Graph {
  const idx = graph.nodes.findIndex((n) => n.id === id);
  if (idx === -1) throw new Error(`Node ${id} not found`);
  const nodes = [...graph.nodes];
  nodes[idx] = fn(nodes[idx]);
  return { ...graph, nodes };
}

function mapRel(graph: Graph, id: string, fn: (r: Relationship) => Relationship): Graph {
  const idx = graph.relationships.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error(`Relationship ${id} not found`);
  const rels = [...graph.relationships];
  rels[idx] = fn(rels[idx]);
  return { ...graph, relationships: rels };
}

function mapEntity(graph: Graph, id: string, fn: <T extends Node | Relationship>(e: T) => T): Graph {
  if (graph.nodes.some((n) => n.id === id)) return mapNode(graph, id, fn);
  if (graph.relationships.some((r) => r.id === id)) return mapRel(graph, id, fn);
  throw new Error(`Entity ${id} not found`);
}
