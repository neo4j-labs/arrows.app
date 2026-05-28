import * as vscode from 'vscode';
import { readdirSync } from 'node:fs';
import { sep } from 'node:path';
import { readGraph, writeGraph } from '@arrows-code/format-json';
import { parseImportInput } from '../parseImportInput';
import { examplesDir, msg, resolveDocument, toUri, workspaceTargetUri } from './helpers';

const TEMPLATE = `{
  "style": {
    "font-family": "sans-serif",
    "background-color": "#ffffff",
    "node-color": "#ffe081"
  },
  "nodes": [
    { "id": "n0", "position": { "x": 0,   "y": 0   }, "caption": "Alice", "labels": ["Person"], "properties": { "name": "'Alice'", "age": "30" }, "style": {} },
    { "id": "n1", "position": { "x": 360, "y": 0   }, "caption": "Bob",   "labels": ["Person"], "properties": { "name": "'Bob'",   "age": "32" }, "style": {} },
    { "id": "n2", "position": { "x": 180, "y": 320 }, "caption": "Hello World", "labels": ["Post"], "properties": { "title": "'Hello World'", "createdAt": "$now" }, "style": {} }
  ],
  "relationships": [
    { "id": "r0", "fromId": "n0", "toId": "n1", "type": "KNOWS",    "properties": { "since": "$today" }, "style": {} },
    { "id": "r1", "fromId": "n0", "toId": "n2", "type": "AUTHORED", "properties": {}, "style": {} },
    { "id": "r2", "fromId": "n1", "toId": "n2", "type": "LIKED",    "properties": {}, "style": {} }
  ]
}
`;

// Focuses the editor group; plain openWith from a tree click leaves focus on the tree.
export async function openFile(uri: vscode.Uri): Promise<void> {
  await vscode.commands.executeCommand('vscode.openWith', uri, 'arrows.preview');
  await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
}

// Bump per "New Graph" so each call gets a unique untitled URI.
let untitledGraphCounter = 0;

export async function newGraph(): Promise<void> {
  untitledGraphCounter += 1;
  const suffix = untitledGraphCounter === 1 ? '' : `-${untitledGraphCounter}`;
  const uri = vscode.Uri.parse(`untitled:Untitled${suffix}.arrows`);
  const doc = await vscode.workspace.openTextDocument(uri);
  if (doc.getText().length === 0) {
    const edit = new vscode.WorkspaceEdit();
    edit.insert(uri, new vscode.Position(0, 0), TEMPLATE);
    await vscode.workspace.applyEdit(edit);
  }
  await vscode.commands.executeCommand('vscode.openWith', uri, 'arrows.preview');
}

export async function openSource(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  await vscode.commands.executeCommand('vscode.openWith', document.uri, 'default', vscode.ViewColumn.Beside);
}

export async function openPreviewToSide(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  await vscode.commands.executeCommand('vscode.openWith', document.uri, 'arrows.preview', vscode.ViewColumn.Beside);
}

interface ExampleInfo { label: string; uri: vscode.Uri }

function examplesRoot(context: vscode.ExtensionContext): string {
  return examplesDir(context).fsPath + sep;
}

function listExamples(context: vscode.ExtensionContext): ExampleInfo[] {
  const dir = examplesDir(context);
  try {
    return readdirSync(dir.fsPath)
      .filter((n) => n.endsWith('.arrows'))
      .sort()
      .map((name) => ({ label: name.replace(/\.arrows$/, ''), uri: vscode.Uri.joinPath(dir, name) }));
  } catch (error) {
    process.stderr.write(`[arrows] listExamples failed: ${msg(error)}\n`);
    return [];
  }
}

async function copyExampleToWorkspace(source: vscode.Uri): Promise<void> {
  const stem = (source.path.split('/').pop() ?? 'graph.arrows').replace(/\.arrows$/, '');
  const target = await vscode.window.showSaveDialog({
    defaultUri: workspaceTargetUri(stem, 'arrows'),
    filters: { Arrows: ['arrows'] },
    saveLabel: 'Use as template',
    title: `Copy "${stem}" to workspace`,
  });
  if (!target) return;
  try {
    const bytes = await vscode.workspace.fs.readFile(source);
    await vscode.workspace.fs.writeFile(target, bytes);
  } catch (error) {
    void vscode.window.showErrorMessage(`Arrows: could not copy template: ${msg(error)}`);
    return;
  }
  await vscode.commands.executeCommand('vscode.openWith', target, 'arrows.preview');
}

export function makeNewFromExample(context: vscode.ExtensionContext) {
  return async (arg?: unknown): Promise<void> => {
    const examples = listExamples(context);
    if (examples.length === 0) {
      void vscode.window.showWarningMessage('Arrows: no bundled examples found in this build.');
      return;
    }
    let source = toUri(arg);
    if (!source) {
      const pick = await vscode.window.showQuickPick(
        examples.map((e) => ({ label: e.label, description: 'bundled example', uri: e.uri })),
        { placeHolder: 'Pick a template to copy into your workspace' }
      );
      if (!pick) return;
      source = pick.uri;
    }
    // Restrict to bundled examples — command is publicly invocable.
    if (!source.fsPath.startsWith(examplesRoot(context))) {
      void vscode.window.showErrorMessage('Arrows: only bundled examples may be used as templates.');
      return;
    }
    await copyExampleToWorkspace(source);
  };
}

export async function importGraph(): Promise<void> {
  const raw = await vscode.window.showInputBox({
    title: 'Import graph',
    prompt: 'Paste an arrows.app share URL (https://arrows.app/#/import/json=…) or raw .arrows JSON',
    placeHolder: 'https://arrows.app/#/import/json=…  or  {"nodes":[…],"relationships":[…],"style":{…}}',
    ignoreFocusOut: true,
    validateInput: (v) =>
      v.trim().length === 0 || parseImportInput(v) ? null : "Doesn't look like a URL or .arrows JSON",
  });
  if (!raw) return;
  const json = parseImportInput(raw);
  if (!json) {
    void vscode.window.showErrorMessage('Arrows: could not recognize the input as a URL or .arrows JSON.');
    return;
  }
  // Round-trip so the saved file uses the canonical shape regardless of source.
  const { graph, diagnostics } = readGraph(json);
  if (diagnostics.some((d) => d.severity === 'error')) {
    void vscode.window.showErrorMessage('Arrows: imported payload does not parse as a valid graph.');
    return;
  }
  const target = await vscode.window.showSaveDialog({
    defaultUri: workspaceTargetUri('imported', 'arrows'),
    filters: { Arrows: ['arrows'] },
    saveLabel: 'Save imported graph',
    title: 'Save imported graph to workspace',
  });
  if (!target) return;
  try {
    await vscode.workspace.fs.writeFile(target, Buffer.from(writeGraph(graph), 'utf8'));
  } catch (error) {
    void vscode.window.showErrorMessage(`Arrows: could not write imported graph: ${msg(error)}`);
    return;
  }
  await vscode.commands.executeCommand('vscode.openWith', target, 'arrows.preview');
}

export async function deleteFile(arg?: unknown): Promise<void> {
  const uri = toUri(arg);
  if (!uri) {
    void vscode.window.showWarningMessage('Arrows: no .arrows file selected.');
    return;
  }
  // Reject non-.arrows or outside-workspace targets; the command is publicly invocable.
  if (!uri.fsPath.endsWith('.arrows')) {
    void vscode.window.showErrorMessage('Arrows: refusing to delete a non-.arrows file.');
    return;
  }
  const folders = vscode.workspace.workspaceFolders ?? [];
  const inWorkspace = folders.some((f) => uri.fsPath.startsWith(f.uri.fsPath + sep));
  if (!inWorkspace) {
    void vscode.window.showErrorMessage('Arrows: refusing to delete a file outside the current workspace.');
    return;
  }
  const choice = await vscode.window.showWarningMessage(
    `Delete ${uri.fsPath}?`,
    { modal: true, detail: 'The file will be moved to the trash.' },
    'Delete'
  );
  if (choice !== 'Delete') return;
  for (const group of vscode.window.tabGroups.all) {
    for (const tab of group.tabs) {
      const input = tab.input as { uri?: vscode.Uri } | undefined;
      if (input?.uri && input.uri.toString() === uri.toString()) {
        try { await vscode.window.tabGroups.close(tab); } catch { /* tab races to close */ }
      }
    }
  }
  try {
    await vscode.workspace.fs.delete(uri, { useTrash: true });
  } catch (error) {
    void vscode.window.showErrorMessage(`Arrows: failed to delete ${uri.fsPath}: ${msg(error)}`);
  }
}
