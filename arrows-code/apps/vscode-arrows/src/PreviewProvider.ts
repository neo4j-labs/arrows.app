import * as vscode from 'vscode';
import { readGraph, writeGraph } from '@arrows-code/format-json';
import { decideApply } from './syncDecision';
import { embedMenuPayload, webviewAllowedCommandIds } from './commandsCatalog';
import { makeRequester, type Requester } from './webviewRequest';
import { buildWebviewHtml } from './webviewHtml';
import { msg, replaceDocumentText } from './commands/helpers';

const TOOLBAR_COMMANDS = webviewAllowedCommandIds;

interface ActivePanel {
  panel: vscode.WebviewPanel;
  ready: Promise<void>;
  svg: Requester;
  graphql: Requester;
  cypher: Requester;
}

export class ArrowsPreviewProvider implements vscode.CustomTextEditorProvider {
  private static panels = new Map<string, ActivePanel>();

  constructor(private readonly context: vscode.ExtensionContext) {}

  private static async requestFromWebview(
    uri: vscode.Uri,
    kind: 'svg' | 'graphql' | 'cypher',
    failLabel: string,
    extra?: Record<string, unknown>
  ): Promise<string> {
    let active = ArrowsPreviewProvider.panels.get(uri.toString());
    if (!active) {
      await vscode.commands.executeCommand('vscode.openWith', uri, 'arrows.preview', { preserveFocus: false });
      active = ArrowsPreviewProvider.panels.get(uri.toString());
    }
    if (!active) throw new Error(`Canvas editor failed to open for ${failLabel} export.`);
    await active.ready;
    return active[kind].request(kind, failLabel, extra);
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
    const cypher = makeRequester({ post });
    const uriStr = document.uri.toString();
    ArrowsPreviewProvider.panels.set(uriStr, { panel, ready: readyPromise, svg, graphql, cypher });

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
        const nextText = writeGraph(
          graph as ReturnType<typeof readGraph>['graph']
        );
        const decision = decideApply({ currentText: document.getText(), nextText });
        if (decision.action === 'skip') return;
        await replaceDocumentText(document, nextText);
      };
      // Tail .catch keeps the chain alive if `task` throws (vs. just returning false).
      const next = applyChain.then(task, task).catch((err) => {
        void vscode.window.showErrorMessage(`Arrows: edit error: ${msg(err)}`);
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
          if (msg.type === 'cypher-result' && typeof msg.requestId === 'string') {
            cypher.resolve(msg.requestId, (msg as { cypher?: string }).cypher, msg.error, 'Cypher');
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
      cypher.rejectAll(closed);
      subs.forEach((d) => d.dispose());
    });

    panel.webview.html = buildWebviewHtml(panel.webview, embedDir);
  }
}
