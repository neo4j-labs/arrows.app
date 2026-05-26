import * as vscode from 'vscode';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { readGraph, writeGraph } from '@arrows-code/format-json';
import { decideApply } from './syncDecision';

// Allowlist — prefix match would let any extension hijack our `arrows.*` namespace.
const TOOLBAR_COMMANDS = new Set<string>([
  'arrows.format',
  'arrows.validate',
  'arrows.exportSvg',
  'arrows.exportCypher',
  'arrows.copyCypher',
  'arrows.openInArrowsApp',
]);

export class ArrowsPreviewProvider implements vscode.CustomTextEditorProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    panel: vscode.WebviewPanel,
  ): Promise<void> {
    const embedDir = vscode.Uri.joinPath(this.context.extensionUri, 'media', 'embed');
    panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [embedDir],
    };

    // Serialize applyEdit calls so two rapid webview emits don't fight over the doc range.
    let applyChain: Promise<unknown> = Promise.resolve();
    let webviewReady = false;
    let pendingLoad: { graph: unknown; docVersion: number } | null = null;

    const sendLoad = (): void => {
      const { graph, diagnostics } = readGraph(document.getText());
      // Half-parsed JSON would blank the canvas; wait for valid text.
      if (diagnostics.some((d) => d.severity === 'error')) return;
      const payload = { type: 'load', graph, docVersion: document.version };
      if (webviewReady) {
        void panel.webview.postMessage(payload);
      } else {
        pendingLoad = payload;
      }
    };

    const applyGraphFromWebview = (graph: unknown): Promise<void> => {
      const task = async (): Promise<void> => {
        const currentText = document.getText();
        const nextText = writeGraph(graph as ReturnType<typeof readGraph>['graph']);
        const decision = decideApply({ currentText, nextText });
        if (decision.action === 'skip') return;
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
          document.uri,
          new vscode.Range(document.positionAt(0), document.positionAt(currentText.length)),
          nextText,
        );
        const applied = await vscode.workspace.applyEdit(edit);
        if (!applied) {
          void vscode.window.showWarningMessage(
            'Arrows: could not apply graph edit to document (read-only or workspace untrusted).',
          );
        }
      };
      // Tail-attached catch: without this, an unexpected throw inside `task`
      // (not just a returned `false`) becomes an unhandled rejection and the
      // chain silently freezes — the webview keeps emitting but nothing applies.
      const next = applyChain.then(task, task).catch((err) => {
        void vscode.window.showErrorMessage(
          `Arrows: edit error: ${err instanceof Error ? err.message : String(err)}`,
        );
      });
      applyChain = next;
      return next;
    };

    const subs: vscode.Disposable[] = [];
    subs.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document.uri.toString() !== document.uri.toString()) return;
        // Every change broadcasts back to the webview. The bridge's emit-history
        // Set drops echoes of its own emits; non-matching loads (genuine external
        // edits, format command, etc.) are applied.
        sendLoad();
      }),
      panel.webview.onDidReceiveMessage((msg: { type: string; graph?: unknown; name?: string }) => {
        if (msg.type === 'ready') {
          webviewReady = true;
          if (pendingLoad) {
            void panel.webview.postMessage(pendingLoad);
            pendingLoad = null;
          } else {
            sendLoad();
          }
          return;
        }
        if (msg.type === 'graph-changed' && msg.graph) {
          void applyGraphFromWebview(msg.graph);
          return;
        }
        if (msg.type === 'command' && typeof msg.name === 'string' && TOOLBAR_COMMANDS.has(msg.name)) {
          void vscode.commands.executeCommand(msg.name, document.uri);
        }
      }),
    );
    panel.onDidDispose(() => subs.forEach((d) => d.dispose()));

    panel.webview.html = buildHtml(panel.webview, embedDir);
  }
}

// Per-load nonce; Vite emits `<script type="module" src=…>` so a nonce on the
// <script> tag plus `script-src 'nonce-XXX'` removes the need for 'unsafe-inline'.
function freshNonce(): string {
  return randomBytes(16).toString('base64');
}

function buildHtml(webview: vscode.Webview, embedDir: vscode.Uri): string {
  const htmlPath = vscode.Uri.joinPath(embedDir, 'embed.html');
  let html: string;
  try {
    html = readFileSync(htmlPath.fsPath, 'utf8');
  } catch (error) {
    process.stderr.write(`[arrows] failed to read embed.html: ${error instanceof Error ? error.message : String(error)}\n`);
    return missingBundleHtml();
  }

  const toWebviewUri = (relPath: string): string =>
    webview.asWebviewUri(vscode.Uri.joinPath(embedDir, relPath)).toString();

  html = html.replace(/(src|href)="\/([^"]+)"/g, (_m, attr, rel) => `${attr}="${toWebviewUri(rel)}"`);
  html = html.replace(/<base[^>]*>/g, '');

  const nonce = freshNonce();
  // Tag every <script> with the nonce so script-src 'nonce-XXX' allows them
  // without 'unsafe-inline'. Vite's bundle emits a single module script.
  html = html.replace(/<script\b(?![^>]*\bnonce=)/g, `<script nonce="${nonce}"`);

  const csp =
    `default-src 'none'; ` +
    `img-src ${webview.cspSource} https: data:; ` +
    `font-src ${webview.cspSource} https: data:; ` +
    `style-src ${webview.cspSource} 'unsafe-inline'; ` +
    `script-src ${webview.cspSource} 'nonce-${nonce}'; ` +
    `connect-src ${webview.cspSource};`;
  html = html.replace(
    /<head>/i,
    `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`,
  );

  return html;
}

function missingBundleHtml(): string {
  return /* html */ `<!doctype html><html><body style="font-family: -apple-system, sans-serif; padding: 2rem;">
    <h3 style="color: #c33;">Embed bundle not found</h3>
    <p>Run <code>npm run build</code> in <code>arrows-code/apps/vscode-arrows/</code> first.</p>
  </body></html>`;
}
