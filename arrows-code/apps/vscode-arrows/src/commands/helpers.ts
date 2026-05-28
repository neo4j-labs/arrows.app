import * as vscode from 'vscode';
import { homedir } from 'node:os';
import { readGraph, writeGraph } from '@arrows-code/format-json';
import { apply } from '../patch';
import type { PatchOp } from '../patch';

export const msg = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

// Sidebar tree items wrap the uri in `{uri, ...}`; palette passes raw vscode.Uri.
export function toUri(arg: unknown): vscode.Uri | undefined {
  if (!arg) return undefined;
  if (arg instanceof vscode.Uri) return arg;
  const candidate =
    (arg as { uri?: unknown; resourceUri?: unknown }).uri ??
    (arg as { resourceUri?: unknown }).resourceUri;
  return candidate instanceof vscode.Uri ? candidate : undefined;
}

export async function resolveDocument(
  arg?: unknown
): Promise<vscode.TextDocument | undefined> {
  const uri = toUri(arg);
  if (uri) {
    try {
      return await vscode.workspace.openTextDocument(uri);
    } catch (error) {
      void vscode.window.showErrorMessage(`Arrows: could not open ${uri.fsPath}: ${msg(error)}`);
      return undefined;
    }
  }
  const active = vscode.window.activeTextEditor?.document;
  if (active && active.fileName.endsWith('.arrows')) return active;
  // Canvas editor focused → activeTextEditor is undefined; read the active tab.
  const activeTab = vscode.window.tabGroups.activeTabGroup?.activeTab;
  const activeInput = activeTab?.input as { uri?: vscode.Uri } | undefined;
  if (activeInput?.uri && activeInput.uri.fsPath.endsWith('.arrows')) {
    return await vscode.workspace.openTextDocument(activeInput.uri);
  }
  for (const group of vscode.window.tabGroups.all) {
    for (const tab of group.tabs) {
      const input = tab.input as { uri?: vscode.Uri } | undefined;
      if (input?.uri && input.uri.fsPath.endsWith('.arrows')) {
        return await vscode.workspace.openTextDocument(input.uri);
      }
    }
  }
  return undefined;
}

export function examplesDir(context: vscode.ExtensionContext): vscode.Uri {
  return vscode.Uri.joinPath(context.extensionUri, 'media', 'examples');
}

export function workspaceTargetUri(stem: string, ext: string): vscode.Uri {
  const folder =
    vscode.workspace.workspaceFolders?.[0]?.uri ?? vscode.Uri.file(homedir());
  return vscode.Uri.joinPath(folder, `${stem}.${ext}`);
}

export function defaultExportUri(document: vscode.TextDocument, ext: string): vscode.Uri {
  const baseName = document.uri.path.split('/').pop() ?? 'graph.arrows';
  const stem = baseName.replace(/\.arrows$/, '');
  if (document.uri.scheme === 'untitled') return workspaceTargetUri(stem, ext);
  return vscode.Uri.file(document.uri.fsPath.replace(/\.arrows$/, `.${ext}`));
}

export async function replaceDocumentText(
  document: vscode.TextDocument,
  nextText: string
): Promise<boolean> {
  const edit = new vscode.WorkspaceEdit();
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(document.getText().length)
  );
  edit.replace(document.uri, fullRange, nextText);
  const applied = await vscode.workspace.applyEdit(edit);
  if (!applied) {
    await vscode.window.showWarningMessage(
      'Arrows: workspace rejected the edit (read-only?).'
    );
  }
  return applied;
}

export async function applyOpsToDocument(
  document: vscode.TextDocument,
  ops: PatchOp[]
): Promise<boolean> {
  const { graph, diagnostics } = readGraph(document.getText());
  if (diagnostics.some((d) => d.severity === 'error')) {
    await vscode.window.showWarningMessage(
      'Arrows: cannot apply edit — document does not parse cleanly.'
    );
    return false;
  }
  const { graph: next, errors } = apply(graph, ops);
  if (errors.length > 0) {
    await vscode.window.showWarningMessage(`Patch error: ${errors[0].message}`);
    return false;
  }
  return replaceDocumentText(document, writeGraph(next));
}

export async function saveExport(
  document: vscode.TextDocument,
  ext: string,
  filters: Record<string, string[]>,
  payload: string
): Promise<void> {
  const target = await vscode.window.showSaveDialog({
    defaultUri: defaultExportUri(document, ext),
    filters,
  });
  if (!target) return;
  await vscode.workspace.fs.writeFile(target, Buffer.from(payload, 'utf8'));
  void vscode.window.showInformationMessage(`Exported ${target.fsPath}`);
}

export async function pickAndRename(
  document: vscode.TextDocument,
  items: string[],
  noun: string,
  buildOp: (oldValue: string, newValue: string) => PatchOp
): Promise<void> {
  if (items.length === 0) {
    void vscode.window.showInformationMessage(`Arrows: no ${noun}s in this graph.`);
    return;
  }
  const oldValue = await vscode.window.showQuickPick(items, { placeHolder: `${noun} to rename` });
  if (!oldValue) return;
  const newValue = await vscode.window.showInputBox({
    prompt: `Rename "${oldValue}" to`,
    value: oldValue,
    validateInput: (v) => (v.trim() === '' ? `${noun} cannot be empty` : null),
  });
  if (!newValue || newValue === oldValue) return;
  await applyOpsToDocument(document, [buildOp(oldValue, newValue)]);
}
