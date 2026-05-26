import { describe, expect, it } from 'vitest';
import { shouldEmit } from './shouldEmit';

describe('shouldEmit', () => {
  it('suppresses emission while a drag gesture is in flight', () => {
    const state = {
      graph: { nodes: [{ id: 'n0', position: { x: 10, y: 10 } }], relationships: [], style: {} },
      mouse: { dragType: 'NODE' },
    };
    const result = shouldEmit({ state, lastSerialized: '' });
    expect(result.emit).toBe(false);
  });

  it('treats the mouse-reducer idle state "NONE" as not dragging', () => {
    const graph = { nodes: [], relationships: [], style: {} };
    const state = { graph, mouse: { dragType: 'NONE' } };
    const result = shouldEmit({ state, lastSerialized: '' });
    expect(result.emit).toBe(true);
  });

  it('emits when idle and the graph differs from lastSerialized', () => {
    const graph = { nodes: [{ id: 'n0' }], relationships: [], style: {} };
    const state = { graph, mouse: { dragType: null } };
    const result = shouldEmit({ state, lastSerialized: '' });
    expect(result.emit).toBe(true);
    expect(result.serialized).toBe(JSON.stringify(graph));
    expect(result.graph).toBe(graph);
  });

  it('suppresses emission when the serialized graph matches lastSerialized', () => {
    const graph = { nodes: [], relationships: [], style: {} };
    const state = { graph, mouse: { dragType: null } };
    const serialized = JSON.stringify(graph);
    const result = shouldEmit({ state, lastSerialized: serialized });
    expect(result.emit).toBe(false);
    expect(result.serialized).toBe(serialized);
  });

  it('suppresses emission while a caption / property is being edited inline', () => {
    const graph = { nodes: [{ id: 'n0' }], relationships: [], style: {} };
    const state = {
      graph,
      mouse: { dragType: 'NONE' },
      selection: { editing: { entityType: 'node', id: 'n0' } },
    };
    const result = shouldEmit({ state, lastSerialized: '' });
    expect(result.emit).toBe(false);
  });

  it('applyHostLoad dispatches a plain action (no clearHistory thunk) so undo history survives', async () => {
    const { applyHostLoad } = await import('./bridge');
    const dispatched: unknown[] = [];
    const fakeStore = {
      dispatch: (a: unknown) => { dispatched.push(a); return a; },
      getState: () => ({}),
      subscribe: () => () => undefined,
    };
    applyHostLoad(fakeStore, { nodes: [], relationships: [], style: {} });
    expect(dispatched).toHaveLength(1);
    const action = dispatched[0] as { type: string };
    expect(action.type).toBe('GETTING_GRAPH_SUCCEEDED');
  });

  it('rehydrate fills in missing style keys so visualGraph.style[key] is never undefined', async () => {
    const { rehydrate } = await import('./bridge');
    const out = rehydrate({
      nodes: [],
      relationships: [],
      style: { 'node-color': '#ffe081' },
    });
    expect((out.style as Record<string, string>)['background-color']).toBeDefined();
  });

  it('suppresses emission when a DOM input is focused (Inspector inputs)', () => {
    const graph = { nodes: [], relationships: [], style: {} };
    const state = { graph, mouse: { dragType: 'NONE' } };
    const result = shouldEmit({ state, lastSerialized: '', isTyping: true });
    expect(result.emit).toBe(false);
  });

  it('reads the redux-undo present slice when graph is wrapped', () => {
    const present = { nodes: [{ id: 'n1' }], relationships: [], style: {} };
    const state = {
      graph: { past: [], present, future: [] },
      mouse: { dragType: null },
    };
    const result = shouldEmit({ state, lastSerialized: '' });
    expect(result.emit).toBe(true);
    expect(result.graph).toBe(present);
  });
});
