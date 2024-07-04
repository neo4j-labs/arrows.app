import { indexablePropertyText } from '@neo4j-arrows/model';
import { completeWithDefaults } from './styling';
import { otherNodeId } from './Relationship';
import { nextAvailableId } from './Id';
import { Point } from './Point';

export const emptyGraph = () => {
  return {
    nodes: [
      {
        id: nextAvailableId([]),
        position: new Point(0, 0),
        caption: '',
        style: {},
        labels: [],
        properties: {},
      },
    ],
    relationships: [],
    style: completeWithDefaults({}),
  };
};

export const getNodeIdMap = (graph) =>
  graph.nodes.reduce((nodeIdMap, node) => {
    nodeIdMap[node.id] = node;
    return nodeIdMap;
  }, {});

export const indexableText = (graph) => {
  const lines = [];
  graph.nodes.forEach((node) => {
    lines.push(node.caption);
    lines.push(...indexablePropertyText(node));
  });
  graph.relationships.forEach((relationship) => {
    lines.push(relationship.type);
    lines.push(...indexablePropertyText(relationship));
  });

  const text = lines.join('\n');
  // size limit is 128K according to https://developers.google.com/drive/api/v3/file
  return text.substr(0, 128000);
};

const addUsedCodePoints = (set, string) => {
  for (const char of string) {
    set.add(char.codePointAt(0));
  }
};

export const usedCodePoints = (graph) => {
  const codePoints = new Set();
  graph.nodes.forEach((node) => {
    addUsedCodePoints(codePoints, node.caption);
    for (const [key, value] of Object.entries(node.properties)) {
      addUsedCodePoints(codePoints, key);
      addUsedCodePoints(codePoints, value);
    }
  });
  graph.relationships.forEach((relationship) => {
    addUsedCodePoints(codePoints, relationship.type);
    for (const [key, value] of Object.entries(relationship.properties)) {
      addUsedCodePoints(codePoints, key);
      addUsedCodePoints(codePoints, value);
    }
  });
  return codePoints;
};

export const neighbourPositions = (node, graph) => {
  return graph.relationships
    .filter(
      (relationship) =>
        node.id === relationship.fromId || node.id === relationship.toId
    )
    .filter((relationship) => relationship.fromId !== relationship.toId)
    .map((relationship) => {
      const otherId = otherNodeId(relationship, node.id);
      const otherNode = graph.nodes.find(
        (otherNode) => otherNode.id === otherId
      );
      return otherNode.position;
    });
};

export const graphsDifferInMoreThanPositions = (graph1, graph2) => {
  return (
    nodesDifferInMoreThanPositions(graph1.nodes, graph2.nodes) ||
    graph1.relationships !== graph2.relationships ||
    graph1.style !== graph2.style
  );
};

const nodesDifferInMoreThanPositions = (nodes1, nodes2) => {
  if (nodes1.length !== nodes2.length) return true;
  return nodes1.some((node1, i) => {
    const node2 = nodes2[i];
    return (
      node1.id !== node2.id ||
      node1.caption !== node2.caption ||
      node1.style !== node2.style ||
      node1.labels !== node2.labels ||
      node1.properties !== node2.properties
    );
  });
};
