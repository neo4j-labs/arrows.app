import { exportCypher } from './exportCypher';

it('creates node', () => {
  const graph = {
    nodes: [{ id: 'n1', labels: [], properties: {}, style: {} }],
    relationships: [],
  };
  const cypher = exportCypher(graph, 'CREATE', {});
  expect(cypher).toEqual('CREATE ()');
});

it('creates nodes', () => {
  const graph = {
    nodes: [
      { id: 'n1', labels: [], properties: { keyA: 'A1' }, style: {} },
      { id: 'n2', labels: [], properties: { keyA: 'A2' }, style: {} },
    ],
    relationships: [],
  };
  const cypher = exportCypher(graph, 'CREATE', {});
  expect(lines(cypher)).toEqual(['CREATE ({keyA: "A1"}),', '({keyA: "A2"})']);
});

it('creates relationship', () => {
  const graph = {
    nodes: [
      { id: 'n1', labels: [], properties: {}, style: {} },
      { id: 'n2', labels: [], properties: {}, style: {} },
    ],
    relationships: [{ fromId: 'n1', toId: 'n2', properties: {}, style: {} }],
  };
  const cypher = exportCypher(graph, 'CREATE', {});
  expect(lines(cypher)).toEqual(['CREATE ()-[:_RELATED]->()']);
});

it('creates relationships', () => {
  const graph = {
    nodes: [
      { id: 'n1', labels: [], properties: {}, style: {} },
      { id: 'n2', labels: [], properties: {}, style: {} },
      { id: 'n3', labels: [], properties: {}, style: {} },
    ],
    relationships: [
      { fromId: 'n1', toId: 'n2', properties: {}, style: {} },
      { fromId: 'n2', toId: 'n3', properties: {}, style: {} },
    ],
  };
  const cypher = exportCypher(graph, 'CREATE', {});
  expect(lines(cypher)).toEqual(['CREATE ()-[:_RELATED]->()-[:_RELATED]->()']);
});

it('creates disconnected relationships', () => {
  const graph = {
    nodes: [
      { id: 'n1', labels: [], properties: {}, style: {} },
      { id: 'n2', labels: [], properties: {}, style: {} },
      { id: 'n3', labels: [], properties: {}, style: {} },
      { id: 'n4', labels: [], properties: {}, style: {} },
    ],
    relationships: [
      { fromId: 'n1', toId: 'n2', properties: {}, style: {} },
      { fromId: 'n3', toId: 'n4', properties: {}, style: {} },
    ],
  };
  const cypher = exportCypher(graph, 'CREATE', {});
  expect(lines(cypher)).toEqual([
    'CREATE ()-[:_RELATED]->(),',
    '()-[:_RELATED]->()',
  ]);
});

it('merges disconnected relationships', () => {
  const graph = {
    nodes: [
      { id: 'n1', labels: [], properties: {}, style: {} },
      { id: 'n2', labels: [], properties: {}, style: {} },
      { id: 'n3', labels: [], properties: {}, style: {} },
      { id: 'n4', labels: [], properties: {}, style: {} },
    ],
    relationships: [
      { fromId: 'n1', toId: 'n2', properties: {}, style: {} },
      { fromId: 'n3', toId: 'n4', properties: {}, style: {} },
    ],
  };
  const cypher = exportCypher(graph, 'MERGE', {});
  expect(lines(cypher)).toEqual([
    'MERGE ()-[:_RELATED]->()',
    'MERGE ()-[:_RELATED]->()',
  ]);
});

const lines = (cypher) => cypher.split('\n');
