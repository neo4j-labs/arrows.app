import * as vscode from 'vscode';
import { readGraph, writeGraph } from '@arrows-code/format-json';
import { LAYOUTS, findLayout, type LayoutId } from '@arrows-code/layout';
import { replaceDocumentText, resolveDocument } from './helpers';

const LAST_LAYOUT_KEY = 'arrows.lastLayoutId';

export function makeFormat(context: vscode.ExtensionContext) {
  return async (arg?: unknown): Promise<void> => {
    const document = await resolveDocument(arg);
    if (!document) return;
    const { graph, diagnostics } = readGraph(document.getText());
    if (diagnostics.some((d) => d.severity === 'error')) {
      void vscode.window.showWarningMessage('Cannot lay out: file does not parse cleanly.');
      return;
    }

    const lastId = context.workspaceState.get<LayoutId>(LAST_LAYOUT_KEY, 'force');
    const items = LAYOUTS.map((l) => ({
      label: l.label,
      description: l.id === lastId ? '(last used)' : undefined,
      detail: l.description,
      layoutId: l.id,
    }));
    const active = items.find((i) => i.layoutId === lastId);
    const pick = await vscode.window.showQuickPick(items, {
      title: 'Auto-arrange nodes',
      placeHolder: 'Pick a layout algorithm',
      matchOnDetail: true,
      ...(active ? { activeItem: active } : {}),
    });
    if (!pick) return;
    await context.workspaceState.update(LAST_LAYOUT_KEY, pick.layoutId);
    const chosen = findLayout(pick.layoutId);
    if (!chosen) return;

    const showSpinner = graph.nodes.length >= 30;
    let laidOut: typeof graph;
    if (showSpinner) {
      laidOut = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Arrows: ${chosen.label.toLowerCase()} layout…`,
          cancellable: false,
        },
        async (progress) => {
          let last = 0;
          const reportProgress = (frac: number): void => {
            progress.report({ increment: (frac - last) * 100 });
            last = frac;
          };
          return (await chosen.run(graph as Parameters<typeof chosen.run>[0], reportProgress)) as typeof graph;
        }
      );
    } else {
      laidOut = (await chosen.run(graph as Parameters<typeof chosen.run>[0])) as typeof graph;
    }

    await replaceDocumentText(document, writeGraph(laidOut));
    void showLayoutAppliedToast(context, chosen, graph.nodes.length);
  };
}

async function showLayoutAppliedToast(
  context: vscode.ExtensionContext,
  applied: { id: LayoutId; label: string },
  nodeCount: number
): Promise<void> {
  const choice = await vscode.window.showInformationMessage(
    `Arrows: applied ${applied.label.toLowerCase()} (${nodeCount} nodes)`,
    'Try another…',
    'Undo'
  );
  if (choice === 'Try another…') {
    await makeFormat(context)();
  } else if (choice === 'Undo') {
    await vscode.commands.executeCommand('undo');
  }
}
