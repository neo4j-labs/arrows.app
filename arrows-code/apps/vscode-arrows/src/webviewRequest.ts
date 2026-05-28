type Pending<T> = { resolve: (v: T) => void; reject: (e: Error) => void };

export interface RequestChannel {
  post: (msg: { type: string; requestId: string; [k: string]: unknown }) => void;
}

export interface Requester {
  request(kind: string, label: string, extra?: Record<string, unknown>): Promise<string>;
  resolve(requestId: string, value: string | undefined, error: string | undefined, label: string): void;
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
    request(kind, label, extra) {
      const requestId = newId(kind);
      return new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(requestId);
          reject(new Error(`Timed out waiting for ${label} from canvas.`));
        }, timeoutMs);
        pending.set(requestId, {
          resolve: (v) => { clearTimeout(timer); resolve(v); },
          reject: (e) => { clearTimeout(timer); reject(e); },
        });
        channel.post({ type: `request-${kind}`, requestId, ...extra });
      });
    },
    resolve(requestId, value, error, label) {
      const p = pending.get(requestId);
      if (!p) return;
      pending.delete(requestId);
      if (typeof value === 'string') p.resolve(value);
      else p.reject(new Error(error ?? `Webview ${label} export failed.`));
    },
    rejectAll(err) {
      for (const p of pending.values()) p.reject(err);
      pending.clear();
    },
    get size() { return pending.size; },
  };
}
