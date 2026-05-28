import { Point, completeWithDefaults } from '@neo4j-arrows/model';
import { renderers, type RenderKind } from './bridgeRender';
import { shouldEmit } from './shouldEmit';
import { isUserBusy } from './userBusy';
import { embedWindow } from './hostPost';
export { isUserBusy };

type AnyStore = {
  dispatch: (a: unknown) => unknown;
  subscribe: (l: () => void) => () => void;
  getState: () => unknown;
};

declare const acquireVsCodeApi:
  | undefined
  | (() => { postMessage: (m: unknown) => void });

interface HostChannel {
  post: (m: unknown) => void;
  name: 'vscode' | 'iframe' | 'test';
}

// Recent emit canonicals; an inbound load matching one is our own echo.
// 30s TTL covers roundtrip slack without growing unboundedly.
const ECHO_TTL_MS = 30_000;

function makeEchoCache(): { remember: (key: string) => void; isEcho: (key: string) => boolean } {
  const seen = new Map<string, number>();
  const now = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const prune = (): void => {
    const cutoff = now() - ECHO_TTL_MS;
    for (const [key, t] of seen) if (t < cutoff) seen.delete(key);
  };
  return {
    remember(key) { prune(); seen.set(key, now()); },
    isEcho(key) { prune(); return seen.has(key); },
  };
}

// Sort keys + drop entityType so host-produced and embed-produced graphs compare equal.
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
  nodes?: Array<{
    position?: { x: number; y: number } | unknown;
    [k: string]: unknown;
  }>;
  relationships?: unknown[];
  style?: unknown;
};

export function rehydrate(graph: IncomingGraph): IncomingGraph {
  return {
    ...graph,
    // Visual* classes do raw graph.style[key] lookups — missing keys crash adaptForBackground.
    style: completeWithDefaults((graph.style ?? {}) as Record<string, unknown>),
    nodes: (graph.nodes ?? []).map((node) => {
      const pos = (node as { position?: { x?: unknown; y?: unknown } })
        .position;
      if (pos && typeof pos === 'object' && !(pos instanceof Point)) {
        return {
          ...node,
          position: new Point(
            Number((pos as { x: unknown }).x) || 0,
            Number((pos as { y: unknown }).y) || 0
          ),
        };
      }
      return node;
    }),
  };
}

// Plain action — bypasses the gettingGraphSucceeded thunk's clearHistory() so undo survives host echoes.
export function applyHostLoad(store: AnyStore, graph: IncomingGraph): void {
  store.dispatch({
    category: 'GRAPH',
    type: 'GETTING_GRAPH_SUCCEEDED',
    storedGraph: graph,
  });
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

export interface EmbedMenuEntry {
  id: string;
  title: string;
  description: string;
  icon?: string;
  shortcut?: { mod?: 'cmd' | 'cmd+shift' | 'shift+alt'; key: string };
}

function isValidMenuEntry(e: unknown): e is EmbedMenuEntry {
  if (!e || typeof e !== 'object') return false;
  const { id, title, description } = e as Record<string, unknown>;
  return (
    typeof id === 'string' &&
    typeof title === 'string' &&
    typeof description === 'string'
  );
}

export interface BridgeHandle {
  receive: (msg: unknown) => void;
  flush: () => void;
  post: (msg: unknown) => void;
}

export function initBridge(
  store: AnyStore,
  opts: InitBridgeOptions = {}
): BridgeHandle {
  const host = opts.host ?? defaultHost();
  const inputFocused = opts.inputFocused ?? isInputFocused;

  let lastSerialized = '';
  let docVersion = -1;
  let pendingLoad: IncomingGraph | null = null;
  const echoes = makeEchoCache();

  const tryApplyPending = (): void => {
    if (!pendingLoad) return;
    if (isUserBusy(store.getState(), inputFocused())) return;
    const raw = pendingLoad;
    pendingLoad = null;
    if (echoes.isEcho(canonical(raw))) return;
    const graph = rehydrate(raw);
    // Pre-arm lastSerialized so the dispatch below doesn't re-emit.
    lastSerialized = JSON.stringify(graph);
    applyHostLoad(store, graph);
  };

  const tryEmit = (): void => {
    if (pendingLoad) {
      tryApplyPending();
      return;
    }
    const decision = shouldEmit({
      state: store.getState(),
      lastSerialized,
      isTyping: inputFocused(),
    });
    if (!decision.emit || !decision.graph) return;
    lastSerialized = decision.serialized;
    echoes.remember(canonical(decision.graph));
    host.post({ type: 'graph-changed', graph: decision.graph, docVersion });
  };

  const receive = (msg: unknown): void => {
    if (!msg || typeof msg !== 'object') return;
    const m = msg as {
      type?: string;
      graph?: IncomingGraph;
      docVersion?: number;
      menu?: EmbedMenuEntry[];
      requestId?: string;
    };
    if (m.type === 'load' && m.graph) {
      if (typeof m.docVersion === 'number') docVersion = m.docVersion;
      if (Array.isArray(m.menu) && m.menu.every(isValidMenuEntry)) {
        embedWindow().__arrowsMenu = m.menu;
        window.dispatchEvent(new CustomEvent('__arrowsMenu'));
      }
      pendingLoad = m.graph;
      tryApplyPending();
      return;
    }
    if (m.type === 'request' && typeof m.requestId === 'string') {
      const { kind, requestId, payload } = m as {
        kind?: RenderKind;
        requestId: string;
        payload?: unknown;
      };
      const reply = (body: { result?: string; error?: string }): void => {
        host.post({ type: 'response', kind, requestId, ...body });
      };
      const renderer = kind ? renderers[kind] : undefined;
      if (!renderer) {
        reply({ error: `Unknown request kind: ${kind}` });
        return;
      }
      // .then-chain catches both sync throws (via the initial Promise.resolve)
      // and async rejections from the renderer.
      Promise.resolve()
        .then(() => renderer(store.getState(), payload))
        .then((result) => reply({ result }))
        .catch((err: unknown) => {
          reply({ error: err instanceof Error ? err.message : String(err) });
        });
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('message', (event: MessageEvent) => {
      if (
        host.name === 'iframe' &&
        event.source !== window.parent &&
        event.source !== window
      )
        return;
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
