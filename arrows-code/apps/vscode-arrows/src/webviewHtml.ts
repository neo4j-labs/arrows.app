// Adapts the embed bundle for a VS Code webview: rewrites absolute asset refs
// via asWebviewUri (HTML lacks a base URL for relative resolution), injects a
// per-load nonce + CSP, and shims focus on the iframe.
import * as vscode from 'vscode';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const FOCUS_SCRIPT = (nonce: string): string => `<script nonce="${nonce}">
  document.addEventListener('mousedown', () => window.focus(), true);
  document.addEventListener('touchstart', () => window.focus(), true);
  window.addEventListener('load', () => window.focus());
</script>`;

const MISSING_BUNDLE_HTML = /* html */ `<!doctype html><html><body style="font-family: -apple-system, sans-serif; padding: 2rem;">
  <h3 style="color: #c33;">Embed bundle not found</h3>
  <p>Run <code>npm run build</code> in <code>arrows-code/apps/vscode-arrows/</code> first.</p>
</body></html>`;

export function buildWebviewHtml(webview: vscode.Webview, embedDir: vscode.Uri): string {
  const htmlPath = vscode.Uri.joinPath(embedDir, 'embed.html');
  let html: string;
  try {
    html = readFileSync(htmlPath.fsPath, 'utf8');
  } catch (error) {
    process.stderr.write(
      `[arrows] failed to read embed.html: ${error instanceof Error ? error.message : String(error)}\n`
    );
    return MISSING_BUNDLE_HTML;
  }

  const toWebviewUri = (rel: string): string =>
    webview.asWebviewUri(vscode.Uri.joinPath(embedDir, rel)).toString();
  const nonce = randomBytes(16).toString('base64');
  // <base> trailing slash is required so the browser appends path segments rather than replacing the last one.
  const baseHref = `${webview.asWebviewUri(embedDir).toString().replace(/\/?$/, '/')}`;

  html = html
    .replace(/(src|href)="\/([^"]+)"/g, (_m, attr, rel) => `${attr}="${toWebviewUri(rel)}"`)
    .replace(/<base[^>]*>/g, '')
    .replace(/<head>/i, `<head><base href="${baseHref}"><meta http-equiv="Content-Security-Policy" content="${csp(webview, nonce)}">`)
    .replace(/<script\b(?![^>]*\bnonce=)/g, `<script nonce="${nonce}"`)
    .replace(/<\/body>/i, `${FOCUS_SCRIPT(nonce)}</body>`);
  return html;
}

function csp(webview: vscode.Webview, nonce: string): string {
  const src = webview.cspSource;
  return [
    `default-src 'none'`,
    `img-src ${src} https: data:`,
    `font-src ${src} https: data:`,
    `style-src ${src} 'unsafe-inline'`,
    `script-src ${src} 'nonce-${nonce}'`,
    `connect-src ${src}`,
  ].join('; ') + ';';
}
