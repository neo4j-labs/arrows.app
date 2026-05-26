import { Point, completeWithDefaults } from '@neo4j-arrows/model';
import { shouldEmit } from './shouldEmit';
import { isUserBusy } from './userBusy';
export { isUserBusy };

type AnyStore = {
  dispatch: (a: unknown) => unknown;
  subscribe: (l: () => void) => () => void;
  getState: () => unknown;
};

declare const acquireVsCodeApi: undefined | (() => { postMessage: (m: unknown) => void });

interface HostChannel { post: (m: unknown) => void; name: 'vscode' | 'iframe' | 'test' }

// Stable JSON for equality regardless of which side produced the graph:
//  - writeGraph (host) sorts keys and strips entityType
//  - reducers (embed) preserve insertion order and omit entityType on freshly created nodes/rels
//  - readGraph (host's sendLoad) reconstructs with entityType added
// Sort keys + drop entityType so the two shapes compare equal.
function canonical(value: unknown): string {
  return JSON.stringify(value, (_k, v) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const sorted: Record<string, unknown> = {};
      for (const k of Object.keys(v).sort()) {
        if (k === 'entityType') continue;
        sorted[k] = (v as Record<string, unknown>)[k];
      }
      return sorted;
    }
    return v;
  });
}

function defaultHost(): HostChannel {
  if (typeof acquireVsCodeApi !== 'undefined') {
    try {
      const api = acquireVsCodeApi();
      return { post: (m) => api.postMessage(m), name: 'vscode' };
    } catch {
      // acquireVsCodeApi is one-shot per webview; fall through.
    }
  }
  return { post: (m) => window.parent.postMessage(m, '*'), name: 'iframe' };
}

type IncomingGraph = {
  nodes?: Array<{ position?: { x: number; y: number } | unknown; [k: string]: unknown }>;
  relationships?: unknown[];
  style?: unknown;
};

export function rehydrate(graph: IncomingGraph): IncomingGraph {
  return {
    ...graph,
    // Visual* classes do raw graph.style[key] lookups — missing keys crash adaptForBackground.
    style: completeWithDefaults((graph.style ?? {}) as Record<string, unknown>),
    nodes: (graph.nodes ?? []).map((node) => {
      const pos = (node as { position?: { x?: unknown; y?: unknown } }).position;
      if (pos && typeof pos === 'object' && !(pos instanceof Point)) {
        return {
          ...node,
          position: new Point(
            Number((pos as { x: unknown }).x) || 0,
            Number((pos as { y: unknown }).y) || 0,
          ),
        };
      }
      return node;
    }),
  };
}

// Plain action — bypasses the gettingGraphSucceeded thunk's clearHistory() so undo survives host echoes.
export function applyHostLoad(store: AnyStore, graph: IncomingGraph): void {
  store.dispatch({ category: 'GRAPH', type: 'GETTING_GRAPH_SUCCEEDED', storedGraph: graph });
}


const isInputFocused = (): boolean => {
  const el = typeof document !== 'undefined' ? document.activeElement : null;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return (el as HTMLElement).isContentEditable === true;
};

export interface InitBridgeOptions {
  host?: HostChannel;
  inputFocused?: () => boolean;
}

export interface BridgeHandle {
  receive: (msg: unknown) => void;
  flush: () => void;
  post: (msg: unknown) => void;
}

export function initBridge(store: AnyStore, opts: InitBridgeOptions = {}): BridgeHandle {
  const host = opts.host ?? defaultHost();
  const inputFocused = opts.inputFocused ?? isInputFocused;

  let lastSerialized = '';
  let docVersion = -1;
  let pendingLoad: IncomingGraph | null = null;

  // Time-indexed map of recent emit serializations. An inbound load whose graph
  // matches any unexpired entry is our own echo — applying it would clobber
  // newer local state. A pure FIFO bound caps under sustained editing (>64
  // distinct emits) and re-introduces the rapid-edit reversal bug; time-based
  // expiry instead keeps every echo recognizable as long as the host echoes
  // within the window (typical roundtrip <100ms; we give 30s slack).
  const ECHO_TTL_MS = 30_000;
  const emittedAt = new Map<string, number>();
  const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const prune = (): void => {
    const cutoff = now() - ECHO_TTL_MS;
    for (const [key, t] of emittedAt) {
      if (t < cutoff) emittedAt.delete(key);
    }
  };
  const rememberEmit = (graph: unknown): void => {
    prune();
    emittedAt.set(canonical(graph), now());
  };
  const isOwnEcho = (graph: unknown): boolean => {
    prune();
    return emittedAt.has(canonical(graph));
  };

  const tryApplyPending = (): void => {
    if (!pendingLoad) return;
    if (isUserBusy(store.getState(), inputFocused())) return;
    const raw = pendingLoad;
    pendingLoad = null;
    // Echo of our own emit — local state is already at-or-past this point. Skip.
    if (isOwnEcho(raw)) return;
    const graph = rehydrate(raw);
    // Pre-arm so the subscribe callback that follows dispatch skips re-emit.
    lastSerialized = JSON.stringify(graph);
    applyHostLoad(store, graph);
  };

  const tryEmit = (): void => {
    if (pendingLoad) {
      tryApplyPending();
      return;
    }
    const decision = shouldEmit({ state: store.getState(), lastSerialized, isTyping: inputFocused() });
    if (!decision.emit || !decision.graph) return;
    lastSerialized = decision.serialized;
    rememberEmit(decision.graph);
    host.post({ type: 'graph-changed', graph: decision.graph, docVersion });
  };

  const receive = (msg: unknown): void => {
    if (!msg || typeof msg !== 'object') return;
    const m = msg as { type?: string; graph?: IncomingGraph; docVersion?: number };
    if (m.type === 'load' && m.graph) {
      if (typeof m.docVersion === 'number') docVersion = m.docVersion;
      pendingLoad = m.graph;
      tryApplyPending();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('message', (event: MessageEvent) => {
      if (host.name === 'iframe' && event.source !== window.parent && event.source !== window) return;
      receive(event.data);
    });
  }

  store.subscribe(tryEmit);

  if (typeof document !== 'undefined') {
    // setTimeout 0: focusout fires before document.activeElement updates.
    document.addEventListener('focusout', () => setTimeout(tryEmit, 0), true);
  }

  host.post({ type: 'ready', host: host.name });

  return { receive, flush: tryEmit, post: host.post };
}
