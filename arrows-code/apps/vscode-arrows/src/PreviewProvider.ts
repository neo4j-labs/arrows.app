import * as vscode from 'vscode';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { readGraph, writeGraph } from '@arrows-code/format-json';
import { decideApply } from './syncDecision';
import { embedMenuPayload, webviewAllowedCommandIds } from './commandsCatalog';
import { makeRequester, type Requester } from './webviewRequest';

const TOOLBAR_COMMANDS = webviewAllowedCommandIds;

interface ActivePanel {
  panel: vscode.WebviewPanel;
  ready: Promise<void>;
  svg: Requester;
  graphql: Requester;
}

export class ArrowsPreviewProvider implements vscode.CustomTextEditorProvider {
  private static panels = new Map<string, ActivePanel>();

  constructor(private readonly context: vscode.ExtensionContext) {}

  private static async requestFromWebview(
    uri: vscode.Uri,
    kind: 'svg' | 'graphql',
    failLabel: string
  ): Promise<string> {
    let active = ArrowsPreviewProvider.panels.get(uri.toString());
    if (!active) {
      await vscode.commands.executeCommand(
        'vscode.openWith',
        uri,
        'arrows.preview',
        { preserveFocus: false }
      );
      active = ArrowsPreviewProvider.panels.get(uri.toString());
    }
    if (!active) {
      throw new Error(`Canvas editor failed to open for ${failLabel} export.`);
    }
    await active.ready;
    const requester = kind === 'svg' ? active.svg : active.graphql;
    return requester.request(kind, failLabel);
  }

  static requestSvg(uri: vscode.Uri): Promise<string> {
    return ArrowsPreviewProvider.requestFromWebview(uri, 'svg', 'SVG');
  }

  static requestGraphQL(uri: vscode.Uri): Promise<string> {
    return ArrowsPreviewProvider.requestFromWebview(uri, 'graphql', 'GraphQL');
  }

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    panel: vscode.WebviewPanel
  ): Promise<void> {
    const embedDir = vscode.Uri.joinPath(
      this.context.extensionUri,
      'media',
      'embed'
    );
    panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [embedDir],
    };

    // Serialize applyEdit so rapid webview emits don't race on the doc range.
    let applyChain: Promise<unknown> = Promise.resolve();
    let webviewReady = false;
    let pendingLoad: { graph: unknown; docVersion: number } | null = null;

    let resolveReady!: () => void;
    const readyPromise = new Promise<void>((r) => {
      resolveReady = r;
    });
    const post = (msg: { type: string; requestId: string }): void => {
      void panel.webview.postMessage(msg);
    };
    const svg = makeRequester({ post });
    const graphql = makeRequester({ post });
    const uriStr = document.uri.toString();
    ArrowsPreviewProvider.panels.set(uriStr, {
      panel,
      ready: readyPromise,
      svg,
      graphql,
    });

    const menuPayload = embedMenuPayload();

    const sendLoad = (): void => {
      const { graph, diagnostics } = readGraph(document.getText());
      // Half-parsed JSON would blank the canvas; wait for valid text.
      if (diagnostics.some((d) => d.severity === 'error')) return;
      const payload = {
        type: 'load',
        graph,
        docVersion: document.version,
        menu: menuPayload,
      };
      if (webviewReady) {
        void panel.webview.postMessage(payload);
      } else {
        pendingLoad = payload;
      }
    };

    const applyGraphFromWebview = (graph: unknown): Promise<void> => {
      const task = async (): Promise<void> => {
        const currentText = document.getText();
        const nextText = writeGraph(
          graph as ReturnType<typeof readGraph>['graph']
        );
        const decision = decideApply({ currentText, nextText });
        if (decision.action === 'skip') return;
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
          document.uri,
          new vscode.Range(
            document.positionAt(0),
            document.positionAt(currentText.length)
          ),
          nextText
        );
        const applied = await vscode.workspace.applyEdit(edit);
        if (!applied) {
          void vscode.window.showWarningMessage(
            'Arrows: could not apply graph edit to document (read-only or workspace untrusted).'
          );
        }
      };
      // Tail .catch keeps the chain alive if `task` throws (vs. just returning false).
      const next = applyChain.then(task, task).catch((err) => {
        void vscode.window.showErrorMessage(
          `Arrows: edit error: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      });
      applyChain = next;
      return next;
    };

    const subs: vscode.Disposable[] = [];
    subs.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document.uri.toString() !== document.uri.toString()) return;
        // Bridge drops own-echoes; genuine external edits get applied.
        sendLoad();
      }),
      panel.webview.onDidReceiveMessage(
        (msg: {
          type: string;
          graph?: unknown;
          name?: string;
          requestId?: string;
          svg?: string;
          graphql?: string;
          error?: string;
        }) => {
          if (msg.type === 'ready') {
            webviewReady = true;
            resolveReady();
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
          if (msg.type === 'svg-result' && typeof msg.requestId === 'string') {
            svg.resolve(msg.requestId, msg.svg, msg.error, 'SVG');
            return;
          }
          if (msg.type === 'graphql-result' && typeof msg.requestId === 'string') {
            graphql.resolve(msg.requestId, msg.graphql, msg.error, 'GraphQL');
            return;
          }
          if (
            msg.type === 'command' &&
            typeof msg.name === 'string' &&
            TOOLBAR_COMMANDS.has(msg.name)
          ) {
            void vscode.commands.executeCommand(msg.name, document.uri);
          }
        }
      )
    );
    panel.onDidDispose(() => {
      ArrowsPreviewProvider.panels.delete(uriStr);
      const closed = new Error('Canvas editor closed during export.');
      svg.rejectAll(closed);
      graphql.rejectAll(closed);
      subs.forEach((d) => d.dispose());
    });

    panel.webview.html = buildHtml(panel.webview, embedDir);
  }
}

function freshNonce(): string {
  return randomBytes(16).toString('base64');
}

function buildHtml(webview: vscode.Webview, embedDir: vscode.Uri): string {
  const htmlPath = vscode.Uri.joinPath(embedDir, 'embed.html');
  let html: string;
  try {
    html = readFileSync(htmlPath.fsPath, 'utf8');
  } catch (error) {
    process.stderr.write(
      `[arrows] failed to read embed.html: ${
        error instanceof Error ? error.message : String(error)
      }\n`
    );
    return missingBundleHtml();
  }

  const toWebviewUri = (relPath: string): string =>
    webview.asWebviewUri(vscode.Uri.joinPath(embedDir, relPath)).toString();

  html = html.replace(
    /(src|href)="\/([^"]+)"/g,
    (_m, attr, rel) => `${attr}="${toWebviewUri(rel)}"`
  );
  html = html.replace(/<base[^>]*>/g, '');

  const nonce = freshNonce();
  html = html.replace(
    /<script\b(?![^>]*\bnonce=)/g,
    `<script nonce="${nonce}"`
  );

  const csp =
    `default-src 'none'; ` +
    `img-src ${webview.cspSource} https: data:; ` +
    `font-src ${webview.cspSource} https: data:; ` +
    `style-src ${webview.cspSource} 'unsafe-inline'; ` +
    `script-src ${webview.cspSource} 'nonce-${nonce}'; ` +
    `connect-src ${webview.cspSource};`;
  html = html.replace(
    /<head>/i,
    `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`
  );

  // Force window.focus on every click so keyboard shortcuts target the canvas.
  const focusScript = `<script nonce="${nonce}">
    (function () {
      var grabFocus = function () { try { window.focus(); } catch (_) {} };
      document.addEventListener('mousedown', grabFocus, true);
      document.addEventListener('touchstart', grabFocus, true);
      window.addEventListener('load', grabFocus);
    })();
  </script>`;
  html = html.replace(/<\/body>/i, `${focusScript}</body>`);

  return html;
}

function missingBundleHtml(): string {
  return /* html */ `<!doctype html><html><body style="font-family: -apple-system, sans-serif; padding: 2rem;">
    <h3 style="color: #c33;">Embed bundle not found</h3>
    <p>Run <code>npm run build</code> in <code>arrows-code/apps/vscode-arrows/</code> first.</p>
  </body></html>`;
}
