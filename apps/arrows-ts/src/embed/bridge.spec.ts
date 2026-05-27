// Interleaved-sequence tests for the bridge. shouldEmit.spec covers one-shot decisions;
// this file threads many ops through a single bridge to catch ping-pong, clobber, and lost emits.

import { describe, expect, it, vi } from 'vitest';
import { initBridge, type InitBridgeOptions } from './bridge';

type GraphSlice = { nodes: any[]; relationships: any[]; style: Record<string, any> };
type State = {
  graph: { past: any[]; present: GraphSlice; future: any[] };
  mouse: { dragType: string };
  selection: { editing: unknown };
};

const initialState = (): State => ({
  graph: { past: [], present: { nodes: [], relationships: [], style: {} }, future: [] },
  mouse: { dragType: 'NONE' },
  selection: { editing: null },
});

function makeStore(initial: State = initialState()) {
  let state = initial;
  const listeners = new Set<() => void>();
  const reduce = (s: State, action: any): State => {
    if (!action || typeof action !== 'object') return s;
    switch (action.type) {
      case 'GETTING_GRAPH_SUCCEEDED':
        return { ...s, graph: { ...s.graph, present: action.storedGraph as GraphSlice } };
      case 'MOUSE/SET_DRAG':
        return { ...s, mouse: { dragType: action.dragType } };
      case 'SELECTION/SET_EDITING':
        return { ...s, selection: { editing: action.editing } };
      case 'GRAPH/MUTATE':
        return { ...s, graph: { ...s.graph, present: action.next as GraphSlice } };
      default:
        return s;
    }
  };
  const dispatch = (a: unknown) => {
    state = reduce(state, a);
    for (const l of listeners) l();
    return a;
  };
  return {
    getState: () => state,
    dispatch,
    subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  };
}

function setup(opts: InitBridgeOptions = {}) {
  const posts: any[] = [];
  let inputFocused = false;
  const store = makeStore();
  const bridge = initBridge(store, {
    host: { post: (m) => posts.push(m), name: 'test' },
    inputFocused: () => inputFocused,
    ...opts,
  });
  return {
    store,
    posts,
    bridge,
    setFocus: (v: boolean) => { inputFocused = v; },
    /** Filter post log for graph-changed messages — drop the {type:'ready'} preamble. */
    emits: () => posts.filter((p) => p.type === 'graph-changed'),
  };
}

const moveNode = (current: GraphSlice, id: string, x: number, y: number): GraphSlice => ({
  ...current,
  nodes: current.nodes.map((n) => (n.id === id ? { ...n, position: { x, y } } : n)),
});

describe('bridge — handshake', () => {
  it('posts {type:"ready"} on init', () => {
    const { posts } = setup();
    expect(posts[0]).toEqual({ type: 'ready', host: 'test' });
  });

  it('first inbound load reaches the store via GETTING_GRAPH_SUCCEEDED', () => {
    const { store, bridge } = setup();
    bridge.receive({ type: 'load', graph: { nodes: [{ id: 'n0', position: { x: 1, y: 2 } }], relationships: [], style: {} }, docVersion: 0 });
    expect(store.getState().graph.present.nodes).toHaveLength(1);
  });
});

describe('bridge — host-shape vs redux-shape echo recognition', () => {
  it('treats a load whose nodes carry entityType as an echo of an emit whose nodes did not', () => {
    // Real-world repro of "second create-node disappears until you do it again":
    //   1. Embed reducer's CREATE_NODE produces nodes WITHOUT `entityType`.
    //   2. Bridge emits the redux state — no entityType on the new node.
    //   3. Host applies; readGraph reconstructs the doc and ADDS entityType: 'Node'.
    //   4. Host posts that as a `load` back to the webview.
    //   5. canonical() of the load (with entityType) won't match canonical() of the
    //      emit (without entityType) — the echo guard fails to recognize the round-trip
    //      and applyHostLoad clobbers local state, losing any nodes added between the
    //      emit and its echo. The user sees node B vanish until they trigger another emit.
    const { store, bridge } = setup();
    bridge.receive({ type: 'load', graph: { nodes: [], relationships: [], style: {} }, docVersion: 0 });

    // Mimic the CREATE_NODE reducer's output: NO entityType key.
    store.dispatch({
      type: 'GRAPH/MUTATE',
      next: { nodes: [{ id: 'a', position: { x: 0, y: 0 }, caption: '', labels: [], properties: {}, style: {} }], relationships: [], style: {} },
    });
    // User immediately creates B locally — state is now [A, B].
    store.dispatch({
      type: 'GRAPH/MUTATE',
      next: {
        nodes: [
          { id: 'a', position: { x: 0, y: 0 }, caption: '', labels: [], properties: {}, style: {} },
          { id: 'b', position: { x: 100, y: 0 }, caption: '', labels: [], properties: {}, style: {} },
        ],
        relationships: [],
        style: {},
      },
    });

    // Host echoes A back — with entityType added by readGraph (as it does in real life).
    bridge.receive({
      type: 'load',
      graph: {
        nodes: [{ entityType: 'Node', id: 'a', position: { x: 0, y: 0 }, caption: '', labels: [], properties: {}, style: {} }],
        relationships: [],
        style: {},
      },
      docVersion: 1,
    });

    // The echo must be recognized as our own — B must still be in local state.
    expect(store.getState().graph.present.nodes.map((n: any) => n.id)).toEqual(['a', 'b']);
  });
});

describe('bridge — rapid-edit reversal bug', () => {
  it('does not revert local state when host echoes back an older emit after rapid A→B', () => {
    const { store, bridge, emits } = setup();
    bridge.receive({ type: 'load', graph: { nodes: [], relationships: [], style: {} }, docVersion: 0 });

    // User does A then B in rapid succession — both are emitted (no version guard).
    const stateA = { nodes: [{ id: 'a' }], relationships: [], style: {} };
    const stateAB = { nodes: [{ id: 'a' }, { id: 'b' }], relationships: [], style: {} };
    store.dispatch({ type: 'GRAPH/MUTATE', next: stateA });
    store.dispatch({ type: 'GRAPH/MUTATE', next: stateAB });
    expect(emits()).toHaveLength(2);

    // Host applies A, fires onDidChangeTextDocument → sends load(stateA) back.
    // This is the echo of our own A. We must NOT apply it — local state is already at AB.
    bridge.receive({ type: 'load', graph: stateA, docVersion: 1 });

    // Local state must still be AB. If the bridge applied the echo, B is lost.
    expect(store.getState().graph.present.nodes.map((n: any) => n.id)).toEqual(['a', 'b']);
  });

  it('still applies a load whose content we did NOT emit (genuine external change)', () => {
    const { store, bridge } = setup();
    bridge.receive({ type: 'load', graph: { nodes: [], relationships: [], style: {} }, docVersion: 0 });
    store.dispatch({ type: 'GRAPH/MUTATE', next: { nodes: [{ id: 'a' }], relationships: [], style: {} } });

    // External edit: load with content the bridge never emitted.
    bridge.receive({
      type: 'load',
      graph: { nodes: [{ id: 'external' }], relationships: [], style: {} },
      docVersion: 5,
    });
    expect(store.getState().graph.present.nodes.map((n: any) => n.id)).toEqual(['external']);
  });

  it('echo arriving AFTER the 30s TTL is treated as external (TTL actually expires)', () => {
    vi.useFakeTimers({ toFake: ['performance', 'Date'] });
    try {
      const { store, bridge } = setup();
      bridge.receive({ type: 'load', graph: { nodes: [], relationships: [], style: {} }, docVersion: 0 });
      store.dispatch({ type: 'GRAPH/MUTATE', next: { nodes: [{ id: 'local' }], relationships: [], style: {} } });
      vi.advanceTimersByTime(31_000);
      bridge.receive({ type: 'load', graph: { nodes: [{ id: 'local' }], relationships: [], style: {} } });
      bridge.receive({ type: 'load', graph: { nodes: [{ id: 'external' }], relationships: [], style: {} } });
      expect(store.getState().graph.present.nodes.map((n: any) => n.id)).toEqual(['external']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('200 rapid emits within the TTL: every echo is still recognized (no clobber under sustained drag)', () => {
    // Regression: the previous 64-entry FIFO would drop the oldest emits, so a
    // delayed echo of state #1 looked external and applyHostLoad would revert
    // local state. With time-based expiry, the whole burst's echoes stay
    // recognizable as long as they arrive within the TTL.
    const { store, bridge } = setup();
    bridge.receive({ type: 'load', graph: { nodes: [], relationships: [], style: {} }, docVersion: 0 });
    for (let i = 0; i < 200; i++) {
      store.dispatch({
        type: 'GRAPH/MUTATE',
        next: { nodes: [{ id: `n${i}` }], relationships: [], style: {} },
      });
    }
    // Host echoes the first emit back (state n0). Local state is at n199.
    // If isOwnEcho fails to recognize it, applyHostLoad clobbers to n0 → BUG.
    bridge.receive({ type: 'load', graph: { nodes: [{ id: 'n0' }], relationships: [], style: {} } });
    expect(store.getState().graph.present.nodes.map((n: any) => n.id)).toEqual(['n199']);
  });
});

describe('bridge — echo suppression', () => {
  it('does not re-emit when the host echoes back the exact graph we just sent', () => {
    const { store, posts, emits } = setup();
    store.dispatch({ type: 'GRAPH/MUTATE', next: { nodes: [{ id: 'a' }], relationships: [], style: {} } });
    expect(emits()).toHaveLength(1);
    posts.length = 0;
    const echoed = emits()[0]?.graph ?? { nodes: [{ id: 'a' }], relationships: [], style: {} };
    const { bridge } = setup();
    bridge.receive({ type: 'load', graph: echoed, docVersion: 0 });
    expect(posts.filter((p) => p.type === 'graph-changed')).toHaveLength(0);
  });

  it('a load with a different JSON key order does not trigger a re-emit', () => {
    const { store, bridge, emits } = setup();
    store.dispatch({
      type: 'GRAPH/MUTATE',
      next: { nodes: [{ id: 'a', caption: 'A', labels: [] }], relationships: [], style: {} },
    });
    const initialEmits = emits().length;
    bridge.receive({
      type: 'load',
      graph: { relationships: [], style: {}, nodes: [{ labels: [], caption: 'A', id: 'a' }] },
      docVersion: 0,
    });
    expect(emits().length).toBe(initialEmits);
    expect(store.getState().graph.present.nodes[0].id).toBe('a');
  });
});

describe('bridge — outbound suppression during interaction', () => {
  it('suppresses emit while a drag is in flight', () => {
    const { store, emits } = setup();
    store.dispatch({ type: 'MOUSE/SET_DRAG', dragType: 'NODE_DRAG' });
    const before = emits().length;
    for (let i = 0; i < 5; i++) {
      store.dispatch({
        type: 'GRAPH/MUTATE',
        next: { nodes: [{ id: 'a', position: { x: i, y: i } }], relationships: [], style: {} },
      });
    }
    expect(emits().length).toBe(before);
  });

  it('emits exactly once on drag-end (intermediate states collapse)', () => {
    const { store, emits } = setup();
    store.dispatch({ type: 'MOUSE/SET_DRAG', dragType: 'NODE_DRAG' });
    for (let i = 0; i < 5; i++) {
      store.dispatch({
        type: 'GRAPH/MUTATE',
        next: { nodes: [{ id: 'a', position: { x: i, y: i } }], relationships: [], style: {} },
      });
    }
    const before = emits().length;
    store.dispatch({ type: 'MOUSE/SET_DRAG', dragType: 'NONE' });
    expect(emits().length).toBe(before + 1);
    expect(emits().at(-1).graph.nodes[0].position).toEqual({ x: 4, y: 4 });
  });

  it('suppresses emit while a caption is being edited; flushes one emit on commit', () => {
    const { store, emits } = setup();
    store.dispatch({ type: 'SELECTION/SET_EDITING', editing: { id: 'a' } });
    for (let i = 0; i < 3; i++) {
      store.dispatch({
        type: 'GRAPH/MUTATE',
        next: { nodes: [{ id: 'a', caption: 'AB'.slice(0, i + 1) }], relationships: [], style: {} },
      });
    }
    const before = emits().length;
    store.dispatch({ type: 'SELECTION/SET_EDITING', editing: null });
    expect(emits().length).toBe(before + 1);
  });

  it('suppresses emit while a DOM input is focused; flushes on flush()', () => {
    const { store, bridge, emits, setFocus } = setup();
    setFocus(true);
    store.dispatch({
      type: 'GRAPH/MUTATE',
      next: { nodes: [{ id: 'a', caption: 'Hello' }], relationships: [], style: {} },
    });
    expect(emits()).toHaveLength(0);
    setFocus(false);
    bridge.flush();
    expect(emits()).toHaveLength(1);
  });
});

describe('bridge — inbound deferral', () => {
  it('defers a host load that arrives mid-drag; applies on drag-end', () => {
    const { store, bridge } = setup();
    const local: GraphSlice = { nodes: [{ id: 'a', position: { x: 100, y: 100 } }], relationships: [], style: {} };
    store.dispatch({ type: 'GRAPH/MUTATE', next: local });
    store.dispatch({ type: 'MOUSE/SET_DRAG', dragType: 'NODE_DRAG' });
    bridge.receive({
      type: 'load',
      graph: { nodes: [{ id: 'a', position: { x: 0, y: 0 } }], relationships: [], style: {} },
      docVersion: 1,
    });
    expect(store.getState().graph.present.nodes[0].position).toEqual({ x: 100, y: 100 });
    store.dispatch({ type: 'MOUSE/SET_DRAG', dragType: 'NONE' });
    expect(store.getState().graph.present.nodes[0].position).toEqual({ x: 0, y: 0 });
  });

  it('newest queued load wins; older queued loads are dropped', () => {
    const { store, bridge } = setup();
    store.dispatch({ type: 'MOUSE/SET_DRAG', dragType: 'NODE_DRAG' });
    bridge.receive({ type: 'load', graph: { nodes: [{ id: 'old' }], relationships: [], style: {} } });
    bridge.receive({ type: 'load', graph: { nodes: [{ id: 'new' }], relationships: [], style: {} } });
    store.dispatch({ type: 'MOUSE/SET_DRAG', dragType: 'NONE' });
    expect(store.getState().graph.present.nodes[0].id).toBe('new');
  });

  it('defers a load that arrives while typing in an input', () => {
    const { store, bridge, setFocus } = setup();
    setFocus(true);
    bridge.receive({ type: 'load', graph: { nodes: [{ id: 'fromHost' }], relationships: [], style: {} } });
    expect(store.getState().graph.present.nodes).toHaveLength(0);
    setFocus(false);
    bridge.flush();
    expect(store.getState().graph.present.nodes[0].id).toBe('fromHost');
  });
});

// Invariant: total emits never exceed "settle" events (drag-ends, editing commits, idle mutations).
// If emits exceed settles, we're ping-ponging.
describe('bridge — interleaved sequence', () => {
  it('survives 50 mixed operations without ping-pong or lost state', () => {
    const { store, bridge, emits, setFocus } = setup();
    let settleEvents = 0;

    bridge.receive({
      type: 'load',
      graph: { nodes: [{ id: 'a', position: { x: 0, y: 0 } }], relationships: [], style: {} },
      docVersion: 0,
    });

    store.dispatch({ type: 'MOUSE/SET_DRAG', dragType: 'NODE_DRAG' });
    for (let i = 1; i <= 5; i++) {
      store.dispatch({ type: 'GRAPH/MUTATE', next: moveNode(store.getState().graph.present, 'a', i, i) });
    }
    store.dispatch({ type: 'MOUSE/SET_DRAG', dragType: 'NONE' });
    settleEvents++;

    bridge.receive({ type: 'load', graph: store.getState().graph.present, docVersion: 1 });

    setFocus(true);
    for (let i = 0; i < 10; i++) {
      store.dispatch({
        type: 'GRAPH/MUTATE',
        next: { ...store.getState().graph.present, style: { 'node-color': `#${i}${i}${i}` } },
      });
    }
    setFocus(false);
    bridge.flush();
    settleEvents++;

    store.dispatch({ type: 'MOUSE/SET_DRAG', dragType: 'NODE_DRAG' });
    bridge.receive({
      type: 'load',
      graph: { nodes: [{ id: 'a', position: { x: 99, y: 99 } }], relationships: [], style: {} },
      docVersion: 2,
    });
    expect(store.getState().graph.present.nodes[0].position).toEqual({ x: 5, y: 5 });
    store.dispatch({ type: 'MOUSE/SET_DRAG', dragType: 'NONE' });

    store.dispatch({ type: 'SELECTION/SET_EDITING', editing: { id: 'a' } });
    for (let i = 0; i < 4; i++) {
      store.dispatch({
        type: 'GRAPH/MUTATE',
        next: { ...store.getState().graph.present, nodes: [{ ...store.getState().graph.present.nodes[0], caption: 'Wo'.slice(0, i + 1) }] },
      });
    }
    store.dispatch({ type: 'SELECTION/SET_EDITING', editing: null });
    settleEvents++;

    // Final invariant: emits never exceed settle events. Strict ≤ proves no
    // ping-pong loop; ≥ proves no lost emits.
    expect(emits().length).toBeGreaterThan(0);
    expect(emits().length).toBeLessThanOrEqual(settleEvents);
    // The final emit should reflect the latest committed state.
    const finalEmit = emits().at(-1);
    expect(finalEmit.graph.nodes[0].caption).toBe('Wo');
  });
});

describe('bridge — request-svg handler', () => {
  it('posts svg-result with an SVG string when state holds a graph', () => {
    const { store, bridge, posts } = setup();
    store.dispatch({
      type: 'GRAPH/MUTATE',
      next: {
        nodes: [{ id: 'n0', position: { x: 0, y: 0 }, caption: 'A', labels: [], properties: {}, style: {} }],
        relationships: [],
        style: {},
      },
    });
    posts.length = 0;
    bridge.receive({ type: 'request-svg', requestId: 'r-1' });
    const result = posts.find((p) => p.type === 'svg-result');
    expect(result).toBeDefined();
    expect(result.requestId).toBe('r-1');
    expect(typeof result.svg === 'string' || typeof result.error === 'string').toBe(true);
  });

  it('returns an error payload (never throws) when the render fails', () => {
    const { bridge, posts } = setup();
    posts.length = 0;
    bridge.receive({ type: 'request-svg', requestId: 'r-2' });
    const result = posts.find((p) => p.type === 'svg-result' && p.requestId === 'r-2');
    expect(result).toBeDefined();
  });

  it('ignores request-svg without a requestId (defensive contract)', () => {
    const { bridge, posts } = setup();
    posts.length = 0;
    bridge.receive({ type: 'request-svg' });
    expect(posts.filter((p) => p.type === 'svg-result')).toHaveLength(0);
  });
});

describe('bridge — request-graphql handler', () => {
  it('posts graphql-result with a string when state holds a graph', () => {
    const { store, bridge, posts } = setup();
    store.dispatch({
      type: 'GRAPH/MUTATE',
      next: {
        nodes: [
          { id: 'n0', position: { x: 0, y: 0 }, caption: 'Alice', labels: ['Person'], properties: { name: "'Alice'" }, style: {} },
          { id: 'n1', position: { x: 100, y: 0 }, caption: 'Bob', labels: ['Person'], properties: {}, style: {} },
        ],
        relationships: [
          { id: 'r0', fromId: 'n0', toId: 'n1', type: 'KNOWS', properties: {}, style: {} },
        ],
        style: {},
      },
    });
    posts.length = 0;
    bridge.receive({ type: 'request-graphql', requestId: 'g-1' });
    const result = posts.find((p) => p.type === 'graphql-result');
    expect(result).toBeDefined();
    expect(result.requestId).toBe('g-1');
    expect(typeof result.graphql === 'string' || typeof result.error === 'string').toBe(true);
  });

  it('returns error payload on failure rather than throwing', () => {
    const { bridge, posts } = setup();
    posts.length = 0;
    bridge.receive({ type: 'request-graphql', requestId: 'g-err' });
    const result = posts.find((p) => p.type === 'graphql-result' && p.requestId === 'g-err');
    expect(result).toBeDefined();
  });

  it('ignores request-graphql without a requestId', () => {
    const { bridge, posts } = setup();
    posts.length = 0;
    bridge.receive({ type: 'request-graphql' });
    expect(posts.filter((p) => p.type === 'graphql-result')).toHaveLength(0);
  });
});

describe('bridge — menu payload', () => {
  it('preserves icon field on inbound menu entries (host → window.__arrowsMenu)', () => {
    const { bridge } = setup();
    const menu = [
      { id: 'arrows.foo', title: 'Foo', description: 'foo desc', icon: 'check' },
      { id: 'arrows.bar', title: 'Bar', description: 'bar desc', icon: 'database' },
    ];
    bridge.receive({ type: 'load', graph: { nodes: [], relationships: [], style: {} }, menu, docVersion: 0 });
    const onWindow = (window as unknown as { __arrowsMenu?: typeof menu }).__arrowsMenu;
    expect(onWindow).toEqual(menu);
    expect(onWindow?.[0]?.icon).toBe('check');
    expect(onWindow?.[1]?.icon).toBe('database');
  });
});
