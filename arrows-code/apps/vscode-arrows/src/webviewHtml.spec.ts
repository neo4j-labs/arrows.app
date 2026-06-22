import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

vi.mock('vscode', () => {
  class Uri {
    constructor(public readonly fsPath: string) {}
    static joinPath(base: Uri, ...rest: string[]): Uri {
      return new Uri(join(base.fsPath, ...rest));
    }
    toString(): string {
      return `webview-resource:${this.fsPath}`;
    }
  }
  return { Uri };
});

import * as vscode from 'vscode';
import { buildWebviewHtml } from './webviewHtml';

interface FakeWebview {
  cspSource: string;
  asWebviewUri: (uri: vscode.Uri) => vscode.Uri;
}

const fakeWebview = (): FakeWebview => ({
  cspSource: 'vscode-webview://test',
  asWebviewUri: (uri) => uri,
});

let tmp: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'arrows-webview-'));
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

function writeEmbed(html: string): vscode.Uri {
  writeFileSync(join(tmp, 'embed.html'), html, 'utf8');
  return new (vscode.Uri as unknown as new (p: string) => vscode.Uri)(tmp);
}

describe('buildWebviewHtml - missing bundle', () => {
  it('returns the missing-bundle placeholder when embed.html is absent', () => {
    const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    const embedDir = new (vscode.Uri as unknown as new (p: string) => vscode.Uri)(
      join(tmp, 'does-not-exist'),
    );
    const html = buildWebviewHtml(fakeWebview() as unknown as vscode.Webview, embedDir);
    expect(html).toContain('Embed bundle not found');
    expect(stderr).toHaveBeenCalledWith(
      expect.stringContaining('[arrows] failed to read embed.html'),
    );
    stderr.mockRestore();
  });
});

describe('buildWebviewHtml - asset URL rewriting', () => {
  it('rewrites absolute src="/x" and href="/x" to webview URIs', () => {
    const embedDir = writeEmbed(
      `<!doctype html><html><head><link rel="stylesheet" href="/assets/main.css"></head>` +
        `<body><script src="/assets/main.js"></script></body></html>`,
    );
    const html = buildWebviewHtml(fakeWebview() as unknown as vscode.Webview, embedDir);
    expect(html).not.toMatch(/href="\/assets\/main\.css"/);
    expect(html).not.toMatch(/src="\/assets\/main\.js"/);
    expect(html).toContain(`href="webview-resource:${join(tmp, 'assets/main.css')}"`);
    expect(html).toContain(`src="webview-resource:${join(tmp, 'assets/main.js')}"`);
  });

  it('replaces any <base> with one pointing at the webview-served embedDir so relative URLs resolve via the asset server', () => {
    const embedDir = writeEmbed(
      `<!doctype html><html><head><base href="/"><title>x</title></head><body></body></html>`,
    );
    const html = buildWebviewHtml(fakeWebview() as unknown as vscode.Webview, embedDir);
    const baseTags = [...html.matchAll(/<base[^>]*\shref="([^"]+)"/g)];
    expect(baseTags.length).toBe(1);
    expect(baseTags[0][1]).toBe(`webview-resource:${embedDir.fsPath}/`);
  });
});

describe('buildWebviewHtml - script nonce + CSP', () => {
  it('adds a nonce to every <script> tag that lacks one', () => {
    const embedDir = writeEmbed(
      `<!doctype html><html><head></head><body>` +
        `<script src="/assets/a.js"></script>` +
        `<script>console.log('inline')</script>` +
        `</body></html>`,
    );
    const html = buildWebviewHtml(fakeWebview() as unknown as vscode.Webview, embedDir);
    const nonces = [...html.matchAll(/<script[^>]*\snonce="([^"]+)"/g)].map((m) => m[1]);
    expect(nonces.length).toBeGreaterThanOrEqual(2);
    expect(new Set(nonces).size).toBe(1);
  });

  it('does not double-nonce a script that already has one', () => {
    const embedDir = writeEmbed(
      `<!doctype html><html><body><script nonce="preset">x</script></body></html>`,
    );
    const html = buildWebviewHtml(fakeWebview() as unknown as vscode.Webview, embedDir);
    const onPresetScript = /<script\s+nonce="preset"(?:\s+nonce="[^"]+")?>/.exec(html);
    expect(onPresetScript?.[0]).toBe('<script nonce="preset">');
  });

  it('injects a CSP meta tag exactly once into <head>', () => {
    const embedDir = writeEmbed(
      `<!doctype html><html><head><title>x</title></head><body></body></html>`,
    );
    const html = buildWebviewHtml(fakeWebview() as unknown as vscode.Webview, embedDir);
    const matches = [...html.matchAll(/<meta http-equiv="Content-Security-Policy"/g)];
    expect(matches.length).toBe(1);
    expect(html).toContain(`default-src 'none'`);
    expect(html).toContain(`script-src vscode-webview://test 'nonce-`);
  });
});

describe('buildWebviewHtml - focus shim', () => {
  it('appends the focus-grabbing script before </body>', () => {
    const embedDir = writeEmbed(
      `<!doctype html><html><body><p>hi</p></body></html>`,
    );
    const html = buildWebviewHtml(fakeWebview() as unknown as vscode.Webview, embedDir);
    expect(html).toMatch(/window\.focus\(\)[\s\S]*<\/body>/);
  });
});

describe('buildWebviewHtml - fresh nonce per call', () => {
  it('generates a different nonce on each invocation', () => {
    const embedDir = writeEmbed(
      `<!doctype html><html><body><script src="/x.js"></script></body></html>`,
    );
    const a = buildWebviewHtml(fakeWebview() as unknown as vscode.Webview, embedDir);
    const b = buildWebviewHtml(fakeWebview() as unknown as vscode.Webview, embedDir);
    const nonceOf = (h: string): string =>
      /<script[^>]*\snonce="([^"]+)"/.exec(h)?.[1] ?? '';
    expect(nonceOf(a)).not.toBe('');
    expect(nonceOf(a)).not.toBe(nonceOf(b));
  });
});
