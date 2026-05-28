type Pending<T> = { resolve: (v: T) => void; reject: (e: Error) => void; label: string };

export interface RequestEnvelope {
  type: 'request';
  kind: string;
  requestId: string;
  payload?: unknown;
}

export interface RequestChannel {
  post: (msg: RequestEnvelope) => void;
}

export interface Requester {
  request(kind: string, label: string, payload?: unknown): Promise<string>;
  resolve(requestId: string, value: string | undefined, error: string | undefined): void;
  rejectAll(err: Error): void;
  readonly size: number;
}

export interface RequesterOptions {
  timeoutMs?: number;
  /** Override for deterministic ids in tests. */
  newId?: (kind: string) => string;
}

export function makeRequester(channel: RequestChannel, opts: RequesterOptions = {}): Requester {
  const pending = new Map<string, Pending<string>>();
  const timeoutMs = opts.timeoutMs ?? 10_000;
  const newId = opts.newId ?? ((kind: string) => `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  return {
    request(kind, label, payload) {
      const requestId = newId(kind);
      return new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(requestId);
          reject(new Error(`Timed out waiting for ${label} from canvas.`));
        }, timeoutMs);
        pending.set(requestId, {
          resolve: (v) => { clearTimeout(timer); resolve(v); },
          reject: (e) => { clearTimeout(timer); reject(e); },
          label,
        });
        channel.post({ type: 'request', kind, requestId, payload });
      });
    },
    resolve(requestId, value, error) {
      const p = pending.get(requestId);
      if (!p) return;
      pending.delete(requestId);
      if (typeof value === 'string') p.resolve(value);
      else p.reject(new Error(error ?? `Webview ${p.label} export failed.`));
    },
    rejectAll(err) {
      for (const p of pending.values()) p.reject(err);
      pending.clear();
    },
    get size() { return pending.size; },
  };
}
