import * as vscode from 'vscode';
import { readGraph, writeGraph } from '@arrows-code/format-json';
import { embedMenuPayload, webviewAllowedCommandIds } from './commandsCatalog';
import { makeRequester, type Requester } from './webviewRequest';
import { buildWebviewHtml } from './webviewHtml';
import { msg, replaceDocumentText } from './commands/helpers';
import { openExternalUrl } from './commands';

interface ActivePanel {
  panel: vscode.WebviewPanel;
  ready: Promise<void>;
  requester: Requester;
}

export class ArrowsPreviewProvider implements vscode.CustomTextEditorProvider {
  private static panels = new Map<string, ActivePanel>();

  constructor(private readonly context: vscode.ExtensionContext) {}

  private static async requestFromWebview(
    uri: vscode.Uri,
    kind: 'svg' | 'graphql' | 'cypher',
    failLabel: string,
    payload?: unknown
  ): Promise<string> {
    let active = ArrowsPreviewProvider.panels.get(uri.toString());
    if (!active) {
      await vscode.commands.executeCommand('vscode.openWith', uri, 'arrows.preview', { preserveFocus: false });
      active = ArrowsPreviewProvider.panels.get(uri.toString());
    }
    if (!active) throw new Error(`Canvas editor failed to open for ${failLabel} export.`);
    await active.ready;
    return active.requester.request(kind, failLabel, payload);
  }

  static requestSvg(uri: vscode.Uri): Promise<string> {
    return ArrowsPreviewProvider.requestFromWebview(uri, 'svg', 'SVG');
  }

  static requestGraphQL(uri: vscode.Uri): Promise<string> {
    return ArrowsPreviewProvider.requestFromWebview(uri, 'graphql', 'GraphQL');
  }

  static requestCypher(uri: vscode.Uri, keyword: 'CREATE' | 'MERGE' | 'MATCH'): Promise<string> {
    return ArrowsPreviewProvider.requestFromWebview(uri, 'cypher', 'Cypher', { keyword });
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
    let disposed = false;

    let resolveReady!: () => void;
    const readyPromise = new Promise<void>((r) => {
      resolveReady = r;
    });
    const requester = makeRequester({
      post: (msg) => { void panel.webview.postMessage(msg); },
    });
    const uriStr = document.uri.toString();
    ArrowsPreviewProvider.panels.set(uriStr, { panel, ready: readyPromise, requester });

    const menuPayload = embedMenuPayload();

    const sendLoad = async (): Promise<void> => {
      const { graph, diagnostics } = readGraph(document.getText());
      // Half-parsed JSON would blank the canvas; wait for valid text.
      if (diagnostics.some((d) => d.severity === 'error')) return;
      await readyPromise;
      void panel.webview.postMessage({
        type: 'load',
        graph,
        docVersion: document.version,
        menu: menuPayload,
      });
    };

    const applyGraphFromWebview = (graph: unknown): Promise<void> => {
      const next = applyChain.then(async () => {
        if (disposed) return;
        try {
          const nextText = writeGraph(graph as ReturnType<typeof readGraph>['graph']);
          if (document.getText() === nextText) return;
          await replaceDocumentText(document, nextText);
        } catch (err) {
          if (disposed) return;
          void vscode.window.showErrorMessage(`Arrows: edit error: ${msg(err)}`);
        }
      });
      applyChain = next;
      return next;
    };

    const subs: vscode.Disposable[] = [];
    subs.push(
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.document.uri.toString() !== document.uri.toString()) return;
        // Bridge drops own-echoes; genuine external edits get applied.
        void sendLoad();
      }),
      panel.webview.onDidReceiveMessage(
        (msg: {
          type: string;
          graph?: unknown;
          name?: string;
          requestId?: string;
          result?: string;
          error?: string;
          url?: string;
          message?: string;
        }) => {
          if (msg.type === 'ready') {
            resolveReady();
            void sendLoad();
            return;
          }
          if (msg.type === 'graph-changed' && msg.graph) {
            void applyGraphFromWebview(msg.graph);
            return;
          }
          if (msg.type === 'response' && typeof msg.requestId === 'string') {
            requester.resolve(msg.requestId, msg.result, msg.error);
            return;
          }
          if (msg.type === 'embed-error') {
            console.error('[arrows-embed]', msg.message, msg.error ?? msg.message);
            return;
          }
          if (
            msg.type === 'command' &&
            typeof msg.name === 'string' &&
            webviewAllowedCommandIds.has(msg.name)
          ) {
            void vscode.commands.executeCommand(msg.name, document.uri);
            return;
          }
          if (msg.type === 'open-external' && typeof msg.url === 'string') {
            void openExternalUrl(msg.url);
          }
        }
      )
    );
    panel.onDidDispose(() => {
      disposed = true;
      ArrowsPreviewProvider.panels.delete(uriStr);
      requester.rejectAll(new Error('Canvas editor closed during export.'));
      subs.forEach((d) => d.dispose());
    });

    panel.webview.html = buildWebviewHtml(panel.webview, embedDir);
  }
}
