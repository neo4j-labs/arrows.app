import * as vscode from 'vscode';
import { homedir } from 'node:os';
import { sep } from 'node:path';
import { readGraph, writeGraph } from '@arrows-code/format-json';
import { renderGraphToSvg } from '@arrows-code/renderer-host';
import { apply } from '@arrows-code/patch';
import type { PatchOp } from '@arrows-code/patch';
import { validate as validateGraph } from '@arrows-code/validator';
import { exportCypher } from '@arrows-code/format-cypher';
import { parseImportInput } from './parseImportInput';

const TEMPLATE = `{
  "style": {
    "font-family": "sans-serif",
    "background-color": "#ffffff",
    "node-color": "#ffe081"
  },
  "nodes": [
    {
      "id": "n0",
      "position": { "x": 0, "y": 0 },
      "caption": "Alice",
      "labels": ["Person"],
      "properties": { "name": "'Alice'", "age": "30" },
      "style": {}
    },
    {
      "id": "n1",
      "position": { "x": 360, "y": 0 },
      "caption": "Bob",
      "labels": ["Person"],
      "properties": { "name": "'Bob'", "age": "32" },
      "style": {}
    },
    {
      "id": "n2",
      "position": { "x": 180, "y": 320 },
      "caption": "Hello World",
      "labels": ["Post"],
      "properties": { "title": "'Hello World'", "createdAt": "$now" },
      "style": {}
    }
  ],
  "relationships": [
    { "id": "r0", "fromId": "n0", "toId": "n1", "type": "KNOWS",   "properties": { "since": "$today" }, "style": {} },
    { "id": "r1", "fromId": "n0", "toId": "n2", "type": "AUTHORED","properties": {},                    "style": {} },
    { "id": "r2", "fromId": "n1", "toId": "n2", "type": "LIKED",   "properties": {},                    "style": {} }
  ]
}
`;

let diagnostics: vscode.DiagnosticCollection | undefined;

export function getDiagnosticCollection(): vscode.DiagnosticCollection {
  if (!diagnostics) diagnostics = vscode.languages.createDiagnosticCollection('arrows');
  return diagnostics;
}

// Sidebar context-menu commands receive the tree's underlying item ({uri, ...}),
// not a vscode.Uri. Normalize so a single command body handles both call paths.
function toUri(arg: unknown): vscode.Uri | undefined {
  if (!arg) return undefined;
  if (arg instanceof vscode.Uri) return arg;
  const candidate = (arg as { uri?: unknown; resourceUri?: unknown }).uri
    ?? (arg as { resourceUri?: unknown }).resourceUri;
  if (candidate instanceof vscode.Uri) return candidate;
  return undefined;
}

async function resolveDocument(arg?: unknown): Promise<vscode.TextDocument | undefined> {
  const uri = toUri(arg);
  if (uri) {
    try {
      return await vscode.workspace.openTextDocument(uri);
    } catch (error) {
      void vscode.window.showErrorMessage(
        `Arrows: could not open ${uri.fsPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return undefined;
    }
  }
  const active = vscode.window.activeTextEditor?.document;
  if (active && active.fileName.endsWith('.arrows')) return active;
  // Custom editors don't surface as activeTextEditor — fall back to tabs.
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

function defaultExportUri(document: vscode.TextDocument, ext: string): vscode.Uri {
  // uri.path is POSIX-style on every OS; safe to split on '/'.
  const baseName = document.uri.path.split('/').pop() ?? 'graph.arrows';
  const stem = baseName.replace(/\.arrows$/, '');
  if (document.uri.scheme === 'untitled') {
    const folder = vscode.workspace.workspaceFolders?.[0]?.uri;
    if (folder) return vscode.Uri.joinPath(folder, `${stem}.${ext}`);
    return vscode.Uri.joinPath(vscode.Uri.file(homedir()), `${stem}.${ext}`);
  }
  return vscode.Uri.file(document.uri.fsPath.replace(/\.arrows$/, `.${ext}`));
}

async function replaceDocumentText(document: vscode.TextDocument, nextText: string): Promise<boolean> {
  const edit = new vscode.WorkspaceEdit();
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(document.getText().length),
  );
  edit.replace(document.uri, fullRange, nextText);
  const applied = await vscode.workspace.applyEdit(edit);
  if (!applied) {
    await vscode.window.showWarningMessage('Arrows: workspace rejected the edit (read-only?).');
  }
  return applied;
}

async function applyOpsToDocument(document: vscode.TextDocument, ops: PatchOp[]): Promise<boolean> {
  const { graph, diagnostics } = readGraph(document.getText());
  if (diagnostics.some((d) => d.severity === 'error')) {
    await vscode.window.showWarningMessage(
      `Arrows: cannot apply edit — document does not parse cleanly.`,
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

async function saveExport(
  document: vscode.TextDocument,
  ext: string,
  filters: Record<string, string[]>,
  payload: string,
): Promise<void> {
  const target = await vscode.window.showSaveDialog({
    defaultUri: defaultExportUri(document, ext),
    filters,
  });
  if (!target) return;
  await vscode.workspace.fs.writeFile(target, Buffer.from(payload, 'utf8'));
  void vscode.window.showInformationMessage(`Exported ${target.fsPath}`);
}

async function pickAndRename(
  document: vscode.TextDocument,
  items: string[],
  noun: string,
  buildOp: (oldValue: string, newValue: string) => PatchOp,
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

// Counter ensures multiple "New Graph" invocations get unique untitled URIs
// — otherwise the second call would attach to the existing untitled doc.
let untitledGraphCounter = 0;

export async function newGraph(): Promise<void> {
  // The custom editor's selector is `*.arrows`, so the URI must end with .arrows
  // for vscode.openWith to find the canvas editor. Use an untitled:// URI with
  // the right extension so the user doesn't have to pick a location up front.
  untitledGraphCounter += 1;
  const suffix = untitledGraphCounter === 1 ? '' : `-${untitledGraphCounter}`;
  const uri = vscode.Uri.parse(`untitled:Untitled${suffix}.arrows`);
  // openTextDocument with a URI doesn't accept `content` directly — open first,
  // then seed the template via WorkspaceEdit so the doc shows up dirty (unsaved).
  const doc = await vscode.workspace.openTextDocument(uri);
  if (doc.getText().length === 0) {
    const edit = new vscode.WorkspaceEdit();
    edit.insert(uri, new vscode.Position(0, 0), TEMPLATE);
    await vscode.workspace.applyEdit(edit);
  }
  await vscode.commands.executeCommand('vscode.openWith', uri, 'arrows.preview');
}

interface ExampleInfo { label: string; uri: vscode.Uri }

function examplesRoot(context: vscode.ExtensionContext): string {
  return vscode.Uri.joinPath(context.extensionUri, 'media', 'examples').fsPath + sep;
}

function listExamples(context: vscode.ExtensionContext): ExampleInfo[] {
  const dir = vscode.Uri.joinPath(context.extensionUri, 'media', 'examples');
  try {
    const fs = require('node:fs') as typeof import('node:fs');
    return fs.readdirSync(dir.fsPath)
      .filter((n) => n.endsWith('.arrows'))
      .sort()
      .map((name) => ({ label: name.replace(/\.arrows$/, ''), uri: vscode.Uri.joinPath(dir, name) }));
  } catch (error) {
    process.stderr.write(
      `[arrows] listExamples failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    return [];
  }
}

/** Copy a bundled example into the workspace and open it. Single entry point so
 *  the palette command, right-click "Use as template", and sidebar quick action
 *  all behave the same. Falls back to home directory if no workspace is open. */
async function copyExampleToWorkspace(source: vscode.Uri): Promise<void> {
  const sourceName = source.path.split('/').pop() ?? 'graph.arrows';
  const stem = sourceName.replace(/\.arrows$/, '');
  const folder = vscode.workspace.workspaceFolders?.[0]?.uri
    ?? vscode.Uri.joinPath(vscode.Uri.file(homedir()));
  const defaultTarget = vscode.Uri.joinPath(folder, `${stem}.arrows`);
  const target = await vscode.window.showSaveDialog({
    defaultUri: defaultTarget,
    filters: { Arrows: ['arrows'] },
    saveLabel: 'Use as template',
    title: `Copy "${stem}" to workspace`,
  });
  if (!target) return;
  try {
    const bytes = await vscode.workspace.fs.readFile(source);
    await vscode.workspace.fs.writeFile(target, bytes);
  } catch (error) {
    void vscode.window.showErrorMessage(
      `Arrows: could not copy template: ${error instanceof Error ? error.message : String(error)}`,
    );
    return;
  }
  await vscode.commands.executeCommand('vscode.openWith', target, 'arrows.preview');
}

/** Palette command — pick a bundled example, save copy in workspace, open it.
 *  Accepts either no arg, an Item from the sidebar tree, or a vscode.Uri pointing
 *  at the example file. */
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
        { placeHolder: 'Pick a template to copy into your workspace' },
      );
      if (!pick) return;
      source = pick.uri;
    }
    // Constrain the source to the bundled examples directory — the command is
    // public, so any extension or `command:` URI could call it with an arbitrary path.
    if (!source.fsPath.startsWith(examplesRoot(context))) {
      void vscode.window.showErrorMessage('Arrows: only bundled examples may be used as templates.');
      return;
    }
    await copyExampleToWorkspace(source);
  };
}

export async function openSource(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  await vscode.commands.executeCommand('vscode.openWith', document.uri, 'default');
}

export async function openPreviewToSide(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  await vscode.commands.executeCommand(
    'vscode.openWith',
    document.uri,
    'arrows.preview',
    vscode.ViewColumn.Beside,
  );
}

export async function format(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  const { graph, diagnostics: diags } = readGraph(document.getText());
  if (diags.some((d) => d.severity === 'error')) {
    void vscode.window.showWarningMessage('Cannot format: file does not parse cleanly.');
    return;
  }
  await replaceDocumentText(document, writeGraph(graph));
}

export async function validate(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  const collection = getDiagnosticCollection();
  const { graph, diagnostics: parseDiags } = readGraph(document.getText());
  const semanticDiags = validateGraph(graph);
  const all = [...parseDiags, ...semanticDiags];
  const vscDiags = all.map((d) => {
    const range = new vscode.Range(0, 0, 0, 1);
    const severity =
      d.severity === 'error' ? vscode.DiagnosticSeverity.Error :
      d.severity === 'warning' ? vscode.DiagnosticSeverity.Warning :
      vscode.DiagnosticSeverity.Information;
    const diag = new vscode.Diagnostic(range, d.message, severity);
    diag.code = d.code;
    diag.source = 'arrows';
    return diag;
  });
  collection.set(document.uri, vscDiags);
  if (vscDiags.length === 0) {
    void vscode.window.showInformationMessage('Arrows: no issues found.');
  } else {
    void vscode.window.showInformationMessage(
      `Arrows: ${vscDiags.length} issue(s) — see Problems panel.`,
    );
  }
}

export async function exportSvg(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  const { graph } = readGraph(document.getText());
  const { svg } = await renderGraphToSvg(graph);
  await saveExport(document, 'svg', { 'SVG image': ['svg'] }, svg);
}

export async function exportCypherCommand(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  const { graph } = readGraph(document.getText());
  const cypher = exportCypher(graph, 'CREATE', { includeStyling: false });
  await saveExport(document, 'cypher', { Cypher: ['cypher', 'cql'] }, cypher);
}

// Browsers vary on URL length: ~2MB in Chrome, ~80KB in Safari. arrows.app
// loads via window.location.hash so the whole graph travels in the URL.
// Warn the user above this; they can still proceed.
const ARROWS_APP_URL_WARN_BYTES = 20_000;
const ARROWS_APP_BASE = 'https://arrows.app';

export async function importGraph(): Promise<void> {
  const raw = await vscode.window.showInputBox({
    title: 'Import graph',
    prompt: 'Paste an arrows.app share URL (https://arrows.app/#/import/json=…) or raw .arrows JSON',
    placeHolder: 'https://arrows.app/#/import/json=…  or  {"nodes":[…],"relationships":[…],"style":{…}}',
    ignoreFocusOut: true,
    validateInput: (v) => (v.trim().length === 0 || parseImportInput(v) ? null : 'Doesn\'t look like a URL or .arrows JSON'),
  });
  if (!raw) return;
  const json = parseImportInput(raw);
  if (!json) {
    void vscode.window.showErrorMessage('Arrows: could not recognize the input as a URL or .arrows JSON.');
    return;
  }
  // Run through readGraph → writeGraph so the on-disk file uses the canonical
  // shape (sorted keys, no entityType discriminator) regardless of source.
  const { graph, diagnostics } = readGraph(json);
  if (diagnostics.some((d) => d.severity === 'error')) {
    void vscode.window.showErrorMessage('Arrows: imported payload does not parse as a valid graph.');
    return;
  }
  const folder = vscode.workspace.workspaceFolders?.[0]?.uri
    ?? vscode.Uri.joinPath(vscode.Uri.file(homedir()));
  const defaultTarget = vscode.Uri.joinPath(folder, 'imported.arrows');
  const target = await vscode.window.showSaveDialog({
    defaultUri: defaultTarget,
    filters: { Arrows: ['arrows'] },
    saveLabel: 'Save imported graph',
    title: 'Save imported graph to workspace',
  });
  if (!target) return;
  try {
    await vscode.workspace.fs.writeFile(target, Buffer.from(writeGraph(graph), 'utf8'));
  } catch (error) {
    void vscode.window.showErrorMessage(
      `Arrows: could not write imported graph: ${error instanceof Error ? error.message : String(error)}`,
    );
    return;
  }
  await vscode.commands.executeCommand('vscode.openWith', target, 'arrows.preview');
}

export async function openInArrowsApp(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  const { graph, diagnostics } = readGraph(document.getText());
  if (diagnostics.some((d) => d.severity === 'error')) {
    void vscode.window.showWarningMessage('Arrows: cannot share — document does not parse cleanly.');
    return;
  }
  // arrows.app's storage reducer matches `#/import/json=<base64>` and base64-decodes
  // into a Graph. Use Buffer for the base64 step (Node side); the web app uses the
  // js-base64 Base64.decode on the receiving end.
  const json = writeGraph(graph);
  if (json.length > ARROWS_APP_URL_WARN_BYTES) {
    const choice = await vscode.window.showWarningMessage(
      `Arrows: graph is ${Math.round(json.length / 1024)} KB. Some browsers may reject the URL.`,
      { modal: false }, 'Open anyway', 'Cancel',
    );
    if (choice !== 'Open anyway') return;
  }
  const b64 = Buffer.from(json, 'utf8').toString('base64');
  const url = `${ARROWS_APP_BASE}/#/import/json=${encodeURIComponent(b64)}`;
  const opened = await vscode.env.openExternal(vscode.Uri.parse(url));
  if (!opened) {
    void vscode.window.showWarningMessage('Arrows: could not open external browser.');
  }
}

export async function copyCypher(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  const { graph } = readGraph(document.getText());
  const cypher = exportCypher(graph, 'CREATE', { includeStyling: false });
  await vscode.env.clipboard.writeText(cypher);
  void vscode.window.showInformationMessage('Arrows: Cypher copied to clipboard.');
}

export async function renameLabel(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  const { graph } = readGraph(document.getText());
  const labels = [...new Set(graph.nodes.flatMap((n) => n.labels))].sort();
  await pickAndRename(document, labels, 'label', (oldLabel, newLabel) => ({
    type: 'renameLabel', oldLabel, newLabel,
  }));
}

export async function deleteFile(arg?: unknown): Promise<void> {
  const uri = toUri(arg);
  if (!uri) {
    void vscode.window.showWarningMessage('Arrows: no .arrows file selected.');
    return;
  }
  // The command is public — reject anything that isn't a .arrows file inside
  // a workspace folder. Without this, a malicious `command:arrows.deleteFile`
  // link could trash arbitrary files (e.g. ~/.ssh/id_rsa).
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
    'Delete',
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
    void vscode.window.showErrorMessage(
      `Arrows: failed to delete ${uri.fsPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function renameRelType(uri?: vscode.Uri): Promise<void> {
  const document = await resolveDocument(uri);
  if (!document) return;
  const { graph } = readGraph(document.getText());
  const types = [...new Set(graph.relationships.map((r) => r.type))].sort();
  await pickAndRename(document, types, 'relationship type', (oldType, newType) => ({
    type: 'renameRelType', oldType, newType,
  }));
}
