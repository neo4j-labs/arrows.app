import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeRequester, type RequestChannel, type RequestEnvelope } from './webviewRequest';

function fakeChannel(): { channel: RequestChannel; posted: RequestEnvelope[] } {
  const posted: RequestEnvelope[] = [];
  return {
    channel: { post: (msg) => posted.push(msg) },
    posted,
  };
}

let counter = 0;
const deterministicId = (kind: string): string => `${kind}-${++counter}`;

afterEach(() => {
  counter = 0;
  vi.useRealTimers();
});

describe('makeRequester - happy path', () => {
  it('posts {type:request, kind, requestId} and resolves on matching result', async () => {
    const { channel, posted } = fakeChannel();
    const r = makeRequester(channel, { newId: deterministicId });
    const pending = r.request('svg', 'SVG');
    expect(posted).toEqual([{ type: 'request', kind: 'svg', requestId: 'svg-1', payload: undefined }]);
    r.resolve('svg-1', '<svg/>', undefined);
    await expect(pending).resolves.toBe('<svg/>');
  });

  it('passes payload through on the request envelope', () => {
    const { channel, posted } = fakeChannel();
    const r = makeRequester(channel, { newId: deterministicId });
    r.request('cypher', 'Cypher', { keyword: 'MERGE' });
    expect(posted[0]).toEqual({
      type: 'request',
      kind: 'cypher',
      requestId: 'cypher-1',
      payload: { keyword: 'MERGE' },
    });
  });

  it('multiple in-flight requests resolve independently', async () => {
    const { channel } = fakeChannel();
    const r = makeRequester(channel, { newId: deterministicId });
    const a = r.request('svg', 'SVG');
    const b = r.request('graphql', 'GraphQL');
    expect(r.size).toBe(2);
    r.resolve('graphql-2', 'type Foo {}', undefined);
    r.resolve('svg-1', '<svg/>', undefined);
    await expect(a).resolves.toBe('<svg/>');
    await expect(b).resolves.toBe('type Foo {}');
    expect(r.size).toBe(0);
  });
});

describe('makeRequester - error paths', () => {
  it('rejects with the webview-provided error message', async () => {
    const { channel } = fakeChannel();
    const r = makeRequester(channel, { newId: deterministicId });
    const p = r.request('svg', 'SVG');
    r.resolve('svg-1', undefined, 'render blew up');
    await expect(p).rejects.toThrow('render blew up');
  });

  it('rejects with a default message that names the request label when value+error are both missing', async () => {
    const { channel } = fakeChannel();
    const r = makeRequester(channel, { newId: deterministicId });
    const p = r.request('svg', 'SVG');
    r.resolve('svg-1', undefined, undefined);
    await expect(p).rejects.toThrow('Webview SVG export failed.');
  });
});

describe('makeRequester - timeout', () => {
  it('rejects after timeoutMs when no result arrives', async () => {
    vi.useFakeTimers();
    const { channel } = fakeChannel();
    const r = makeRequester(channel, { newId: deterministicId, timeoutMs: 5_000 });
    const p = r.request('svg', 'SVG');
    vi.advanceTimersByTime(4_999);
    expect(r.size).toBe(1);
    vi.advanceTimersByTime(2);
    await expect(p).rejects.toThrow(/Timed out waiting for SVG/);
    expect(r.size).toBe(0);
  });

  it('does NOT fire the timeout once the request resolves', async () => {
    vi.useFakeTimers();
    const { channel } = fakeChannel();
    const r = makeRequester(channel, { newId: deterministicId, timeoutMs: 5_000 });
    const p = r.request('svg', 'SVG');
    r.resolve('svg-1', '<svg/>', undefined);
    vi.advanceTimersByTime(10_000);
    await expect(p).resolves.toBe('<svg/>');
  });
});

describe('makeRequester - guard rails', () => {
  it('resolve() for an unknown requestId is a silent no-op (late ghost message)', () => {
    const { channel } = fakeChannel();
    const r = makeRequester(channel, { newId: deterministicId });
    expect(() => r.resolve('does-not-exist', 'x', undefined)).not.toThrow();
  });

  it('resolving twice with the same id is a no-op (second resolve does not double-fire)', async () => {
    const { channel } = fakeChannel();
    const r = makeRequester(channel, { newId: deterministicId });
    const p = r.request('svg', 'SVG');
    r.resolve('svg-1', 'first', undefined);
    r.resolve('svg-1', 'second', undefined);
    await expect(p).resolves.toBe('first');
    expect(r.size).toBe(0);
  });

  it('rejectAll fires every pending and clears the map', async () => {
    const { channel } = fakeChannel();
    const r = makeRequester(channel, { newId: deterministicId });
    const a = r.request('svg', 'SVG');
    const b = r.request('svg', 'SVG');
    expect(r.size).toBe(2);
    r.rejectAll(new Error('panel disposed'));
    await expect(a).rejects.toThrow('panel disposed');
    await expect(b).rejects.toThrow('panel disposed');
    expect(r.size).toBe(0);
  });

  it('size decrements when a request rejects via timeout', async () => {
    vi.useFakeTimers();
    const { channel } = fakeChannel();
    const r = makeRequester(channel, { newId: deterministicId, timeoutMs: 100 });
    const p = r.request('svg', 'SVG');
    expect(r.size).toBe(1);
    vi.advanceTimersByTime(150);
    await expect(p).rejects.toThrow();
    expect(r.size).toBe(0);
  });
});

describe('makeRequester - channel contract', () => {
  it('only posts to the channel on request, not on resolve', () => {
    const { channel, posted } = fakeChannel();
    const r = makeRequester(channel, { newId: deterministicId });
    r.request('svg', 'SVG');
    expect(posted).toHaveLength(1);
    r.resolve('svg-1', 'x', undefined);
    expect(posted).toHaveLength(1);
  });
});
