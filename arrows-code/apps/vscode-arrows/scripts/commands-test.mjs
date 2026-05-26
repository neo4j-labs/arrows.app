#!/usr/bin/env node
/**
 * Boot real VS Code and drive every contributed command end-to-end.
 * For each command:
 *   - stub the interactive UI (save dialogs, quick picks, input boxes)
 *   - executeCommand
 *   - assert the observable side-effect (file written, clipboard set,
 *     document text changed, diagnostic surfaced, etc.)
 *
 * The whole script exits non-zero if any single command fails.
 */
import { runTests } from '@vscode/test-electron';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extensionDevelopmentPath = resolve(__dirname, '..');
const testRunnerDir = resolve(__dirname, '..', 'dist', 'commands-test-runner');
mkdirSync(testRunnerDir, { recursive: true });

const workdir = mkdtempSync(resolve(tmpdir(), 'arrows-cmd-'));
const fixtureCopy = resolve(workdir, 'sample.arrows');
// Inline known-good Alice/Bob graph — robust to fixture file edits in arrows-code/fixtures/.
writeFileSync(fixtureCopy, JSON.stringify({
  style: { 'node-color': '#ffe081', 'font-family': 'sans-serif' },
  nodes: [
    { id: 'n0', position: { x: 0, y: 0 }, caption: 'Alice', labels: ['Person'], properties: { name: "'Alice'" }, style: {} },
    { id: 'n1', position: { x: 400, y: 0 }, caption: 'Bob', labels: ['Person'], properties: { name: "'Bob'" }, style: {} },
  ],
  relationships: [
    { id: 'r0', fromId: 'n0', toId: 'n1', type: 'KNOWS', properties: {}, style: {} },
  ],
}, null, 2));

const runnerPath = resolve(testRunnerDir, 'index.js');
writeFileSync(
  runnerPath,
  `
const vscode = require('vscode');
const path = require('node:path');
const fs = require('node:fs');

const fixturePath = ${JSON.stringify(fixtureCopy)};
const workdir = ${JSON.stringify(workdir)};

const failures = [];
function check(label, cond, detail) {
  if (!cond) {
    failures.push(label + (detail ? ' — ' + detail : ''));
    console.log('  ✗ ' + label + (detail ? '\\n      ' + detail : ''));
  } else {
    console.log('  ✓ ' + label);
  }
}

async function openFixture() {
  const uri = vscode.Uri.file(fixturePath);
  const doc = await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc, { preview: false });
  return doc;
}

/** Replace a property of vscode.window with a stub. Returns a restore fn. */
function stub(obj, key, fn) {
  const original = obj[key];
  obj[key] = fn;
  return () => { obj[key] = original; };
}

exports.run = async function () {
  const ext = vscode.extensions.getExtension('neo4j-labs.arrows-code-vscode-arrows');
  if (!ext) throw new Error('Extension not loaded');
  await ext.activate();

  // ---------- arrows.newGraph ---------------------------------------------
  await (async () => {
    console.log('\\n▸ arrows.newGraph');
    const before = vscode.workspace.textDocuments.length;
    await vscode.commands.executeCommand('arrows.newGraph');
    const after = vscode.workspace.textDocuments.length;
    check('opens a new untitled .arrows document', after > before);
    const doc = vscode.workspace.textDocuments.find((d) => d.uri.scheme === 'untitled');
    check('template contains Alice node', doc && /"Alice"/.test(doc.getText()));
  })();

  // ---------- arrows.format -----------------------------------------------
  await (async () => {
    console.log('\\n▸ arrows.format');
    const doc = await openFixture();
    const before = doc.getText();
    await vscode.commands.executeCommand('arrows.format', doc.uri);
    const after = doc.getText();
    check('produces parseable JSON', (() => { try { JSON.parse(after); return true; } catch { return false; } })());
    const parsed = JSON.parse(after);
    check('canonical key order', Object.keys(parsed).join(',') === 'nodes,relationships,style');
  })();

  // ---------- arrows.validate ---------------------------------------------
  await (async () => {
    console.log('\\n▸ arrows.validate');
    const doc = await openFixture();
    let infoShown = false;
    const restore = stub(vscode.window, 'showInformationMessage', async (msg) => { infoShown = msg; return undefined; });
    try {
      await vscode.commands.executeCommand('arrows.validate', doc.uri);
      check('shows a status message', !!infoShown);
    } finally { restore(); }
  })();

  // ---------- arrows.copyCypher -------------------------------------------
  await (async () => {
    console.log('\\n▸ arrows.copyCypher');
    const doc = await openFixture();
    await vscode.commands.executeCommand('arrows.copyCypher', doc.uri);
    const clip = await vscode.env.clipboard.readText();
    check('clipboard contains CREATE statements', /CREATE/.test(clip));
    check('clipboard contains :Person label', /:Person/.test(clip));
  })();

  // ---------- arrows.exportCypher -----------------------------------------
  await (async () => {
    console.log('\\n▸ arrows.exportCypher');
    const doc = await openFixture();
    const target = vscode.Uri.file(path.join(workdir, 'export-test.cypher'));
    const restore = stub(vscode.window, 'showSaveDialog', async (opts) => {
      check('save dialog default URI is writable', !!opts.defaultUri && opts.defaultUri.fsPath.startsWith(workdir));
      return target;
    });
    try {
      await vscode.commands.executeCommand('arrows.exportCypher', doc.uri);
      check('file was written', fs.existsSync(target.fsPath));
      const content = fs.readFileSync(target.fsPath, 'utf8');
      check('exported Cypher has CREATE', /CREATE/.test(content));
    } finally { restore(); }
  })();

  // ---------- arrows.exportSvg --------------------------------------------
  await (async () => {
    console.log('\\n▸ arrows.exportSvg');
    const doc = await openFixture();
    const target = vscode.Uri.file(path.join(workdir, 'export-test.svg'));
    const restore = stub(vscode.window, 'showSaveDialog', async () => target);
    try {
      await vscode.commands.executeCommand('arrows.exportSvg', doc.uri);
      check('file was written', fs.existsSync(target.fsPath));
      const content = fs.readFileSync(target.fsPath, 'utf8');
      check('contains <svg', /<svg/.test(content));
    } finally { restore(); }
  })();

  // ---------- arrows.renameLabel ------------------------------------------
  await (async () => {
    console.log('\\n▸ arrows.renameLabel');
    const doc = await openFixture();
    const restoreQp = stub(vscode.window, 'showQuickPick', async (items) => {
      check('quick pick offered Person', Array.isArray(items) && items.includes('Person'));
      return 'Person';
    });
    const restoreIb = stub(vscode.window, 'showInputBox', async () => 'Customer');
    try {
      await vscode.commands.executeCommand('arrows.renameLabel', doc.uri);
      await new Promise((r) => setTimeout(r, 200));
      const text = doc.getText();
      check('graph now contains Customer label', text.includes('"Customer"'));
      check('graph no longer contains Person label', !/"Person"/.test(text));
    } finally { restoreQp(); restoreIb(); }
  })();

  // ---------- arrows.renameLabel — cancel path ----------------------------
  await (async () => {
    console.log('\\n▸ arrows.renameLabel (user cancels)');
    const doc = await openFixture();
    const before = doc.getText();
    // User cancels at the QuickPick by returning undefined.
    const restoreQp = stub(vscode.window, 'showQuickPick', async () => undefined);
    const restoreIb = stub(vscode.window, 'showInputBox', async () => { throw new Error('should not be called'); });
    try {
      await vscode.commands.executeCommand('arrows.renameLabel', doc.uri);
      await new Promise((r) => setTimeout(r, 100));
      check('doc unchanged when user cancels rename', doc.getText() === before);
    } finally { restoreQp(); restoreIb(); }
  })();

  // ---------- arrows.format — invalid JSON path ---------------------------
  await (async () => {
    console.log('\\n▸ arrows.format (invalid JSON)');
    const badPath = path.join(workdir, 'invalid.arrows');
    fs.writeFileSync(badPath, '{not valid json');
    const badUri = vscode.Uri.file(badPath);
    const doc = await vscode.workspace.openTextDocument(badUri);
    const before = doc.getText();
    let warned = false;
    const restore = stub(vscode.window, 'showWarningMessage', async (msg) => { warned = msg; return undefined; });
    try {
      await vscode.commands.executeCommand('arrows.format', badUri);
      check('format warns user when JSON does not parse', !!warned);
      check('format leaves document unchanged on parse error', doc.getText() === before);
    } finally { restore(); }
  })();

  // ---------- arrows.newFromExample (palette → quick-pick → save dialog) ----
  await (async () => {
    console.log('\\n▸ arrows.newFromExample (palette path)');
    // Find the bundled examples dir on the installed extension.
    const ext = vscode.extensions.getExtension('neo4j-labs.arrows-code-vscode-arrows');
    const examplesDir = path.join(ext.extensionPath, 'media', 'examples');
    const exampleName = 'movies';
    const exampleUri = vscode.Uri.file(path.join(examplesDir, exampleName + '.arrows'));
    const target = path.join(workdir, 'from-template.arrows');
    const restoreQp = stub(vscode.window, 'showQuickPick', async () => ({ label: exampleName, uri: exampleUri }));
    const restoreSd = stub(vscode.window, 'showSaveDialog', async () => vscode.Uri.file(target));
    try {
      await vscode.commands.executeCommand('arrows.newFromExample');
      const copied = fs.existsSync(target);
      check('newFromExample copies the picked example into the chosen target', copied);
      if (copied) {
        const text = fs.readFileSync(target, 'utf8');
        const graph = JSON.parse(text);
        check('copied example parses as JSON with nodes', Array.isArray(graph.nodes) && graph.nodes.length > 0);
        fs.rmSync(target);
      }
    } finally { restoreQp(); restoreSd(); }
  })();

  await (async () => {
    console.log('\\n▸ arrows.newFromExample (sidebar item arg path)');
    const ext = vscode.extensions.getExtension('neo4j-labs.arrows-code-vscode-arrows');
    const exampleUri = vscode.Uri.file(path.join(ext.extensionPath, 'media', 'examples', 'social.arrows'));
    const target = path.join(workdir, 'social-template.arrows');
    const restoreSd = stub(vscode.window, 'showSaveDialog', async () => vscode.Uri.file(target));
    try {
      // Pass the tree-item arg — exercises the toUri coercion + skips the quick pick.
      await vscode.commands.executeCommand('arrows.newFromExample', { kind: 'example', uri: exampleUri, label: 'social' });
      check('newFromExample accepts {uri} arg and skips quick-pick', fs.existsSync(target));
      if (fs.existsSync(target)) fs.rmSync(target);
    } finally { restoreSd(); }
  })();

  // ---------- arrows.openInArrowsApp ---------------------------------------
  await (async () => {
    console.log('\\n▸ arrows.openInArrowsApp');
    const doc = await openFixture();
    let openedUri = null;
    const restore = stub(vscode.env, 'openExternal', async (uri) => { openedUri = uri; return true; });
    try {
      await vscode.commands.executeCommand('arrows.openInArrowsApp', doc.uri);
      check('openInArrowsApp called env.openExternal', !!openedUri);
      check('URL is arrows.app HTTPS', openedUri && openedUri.scheme === 'https' && openedUri.authority === 'arrows.app');
      check('URL fragment carries the import-json payload', openedUri && openedUri.fragment.startsWith('/import/json='));
      if (openedUri && openedUri.fragment.startsWith('/import/json=')) {
        const b64 = decodeURIComponent(openedUri.fragment.slice('/import/json='.length));
        const decoded = Buffer.from(b64, 'base64').toString('utf8');
        let parsed;
        try { parsed = JSON.parse(decoded); } catch { /* fail next check */ }
        check('payload round-trips to a Graph with nodes', !!parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0);
      }
    } finally { restore(); }
  })();

  // ---------- arrows.deleteFile --------------------------------------------
  await (async () => {
    console.log('\\n▸ arrows.deleteFile');
    const victimPath = path.join(workdir, 'delete-me.arrows');
    fs.writeFileSync(victimPath, JSON.stringify({ nodes: [], relationships: [], style: {} }));
    const restoreConfirm = stub(vscode.window, 'showWarningMessage', async () => 'Delete');
    try {
      await vscode.commands.executeCommand('arrows.deleteFile', vscode.Uri.file(victimPath));
      check('deleteFile removes the file from disk', !fs.existsSync(victimPath));
    } finally { restoreConfirm(); }
  })();

  await (async () => {
    console.log('\\n▸ arrows.deleteFile (called with tree-item arg, not Uri)');
    const victimPath = path.join(workdir, 'tree-arg.arrows');
    fs.writeFileSync(victimPath, JSON.stringify({ nodes: [], relationships: [], style: {} }));
    const restoreConfirm = stub(vscode.window, 'showWarningMessage', async () => 'Delete');
    // Sidebar passes the underlying tree item ({ kind, label, uri }) — not vscode.Uri.
    const treeItem = { kind: 'workspace-file', label: 'tree-arg.arrows', uri: vscode.Uri.file(victimPath) };
    try {
      await vscode.commands.executeCommand('arrows.deleteFile', treeItem);
      check('deleteFile accepts {uri} tree-item args from sidebar', !fs.existsSync(victimPath));
    } finally { restoreConfirm(); fs.rmSync(victimPath, { force: true }); }
  })();

  await (async () => {
    console.log('\\n▸ arrows.deleteFile (user cancels)');
    const victimPath = path.join(workdir, 'keep-me.arrows');
    fs.writeFileSync(victimPath, JSON.stringify({ nodes: [], relationships: [], style: {} }));
    const restoreConfirm = stub(vscode.window, 'showWarningMessage', async () => undefined);
    try {
      await vscode.commands.executeCommand('arrows.deleteFile', vscode.Uri.file(victimPath));
      check('deleteFile keeps file when user cancels confirmation', fs.existsSync(victimPath));
    } finally { restoreConfirm(); fs.rmSync(victimPath, { force: true }); }
  })();

  // ---------- arrows.openSource -------------------------------------------
  await (async () => {
    console.log('\\n▸ arrows.openSource');
    let threw = false;
    try { await vscode.commands.executeCommand('arrows.openSource', vscode.Uri.file(fixturePath)); }
    catch { threw = true; }
    check('openSource runs without throwing', !threw);
  })();

  // ---------- arrows.copyCypher — no .arrows doc resolved ------------------
  await (async () => {
    console.log('\\n▸ arrows.copyCypher (no .arrows doc)');
    // Close all .arrows tabs first so resolveDocument returns undefined.
    // Some tabs may already be invalidated by prior tests (e.g. deleteFile);
    // tolerate "not found" so this is a pre-condition step, not an assertion.
    for (const group of vscode.window.tabGroups.all) {
      for (const tab of group.tabs) {
        if (tab.input && tab.input.uri && tab.input.uri.fsPath.endsWith('.arrows')) {
          try { await vscode.window.tabGroups.close(tab); } catch { /* stale tab */ }
        }
      }
    }
    let threw = false;
    try { await vscode.commands.executeCommand('arrows.copyCypher'); }
    catch { threw = true; }
    check('copyCypher does not throw when no .arrows doc is open', !threw);
  })();

  // ---------- arrows.renameRelType ----------------------------------------
  await (async () => {
    console.log('\\n▸ arrows.renameRelType');
    const doc = await openFixture();
    const restoreQp = stub(vscode.window, 'showQuickPick', async () => 'KNOWS');
    const restoreIb = stub(vscode.window, 'showInputBox', async () => 'FOLLOWS');
    try {
      await vscode.commands.executeCommand('arrows.renameRelType', doc.uri);
      await new Promise((r) => setTimeout(r, 200));
      const text = doc.getText();
      check('graph now contains FOLLOWS rel type', text.includes('"FOLLOWS"'));
    } finally { restoreQp(); restoreIb(); }
  })();

  // ---------- arrows.exportSvg — default URI anchors to workspace folder ---
  await (async () => {
    console.log('\\n▸ arrows.exportSvg (default URI for untitled docs)');
    await vscode.commands.executeCommand('arrows.newGraph');
    let dialogUri = null;
    const restore = stub(vscode.window, 'showSaveDialog', async (opts) => {
      dialogUri = opts.defaultUri;
      return undefined; // user cancels
    });
    try {
      await vscode.commands.executeCommand('arrows.exportSvg');
      check(
        'untitled → save dialog defaults inside workspace, not /',
        !!dialogUri && dialogUri.fsPath.startsWith(workdir),
      );
    } finally { restore(); }
  })();

  // ---------- arrows.renameLabel — empty-labels guard ---------------------
  await (async () => {
    console.log('\\n▸ arrows.renameLabel (no labels in graph)');
    const emptyPath = path.join(workdir, 'empty-labels.arrows');
    fs.writeFileSync(emptyPath, JSON.stringify({
      nodes: [{ id: 'n0', position: { x: 0, y: 0 }, caption: '', labels: [], properties: {}, style: {} }],
      relationships: [],
      style: {},
    }));
    let infoMsg = null;
    const restore = stub(vscode.window, 'showInformationMessage', async (msg) => { infoMsg = msg; return undefined; });
    try {
      await vscode.commands.executeCommand('arrows.renameLabel', vscode.Uri.file(emptyPath));
      check('renameLabel shows info message when no labels exist', !!infoMsg && /no labels/i.test(infoMsg));
    } finally { restore(); }
  })();

  // ---------- arrows.openPreviewToSide ------------------------------------
  await (async () => {
    console.log('\\n▸ arrows.openPreviewToSide');
    await openFixture();
    await vscode.commands.executeCommand('arrows.openPreviewToSide', vscode.Uri.file(fixturePath));
    await new Promise((r) => setTimeout(r, 500));
    const tabs = vscode.window.tabGroups.all.flatMap((g) => g.tabs);
    const previewTab = tabs.find((t) => t.input && t.input.viewType === 'arrows.preview');
    check('preview tab opened', !!previewTab);
  })();

  // ---------- arrows.sidebar.refresh --------------------------------------
  await (async () => {
    console.log('\\n▸ arrows.sidebar.refresh');
    let threw = false;
    try { await vscode.commands.executeCommand('arrows.sidebar.refresh'); }
    catch (e) { threw = true; }
    check('refresh command does not throw', !threw);
  })();

  console.log('');
  if (failures.length) {
    throw new Error(failures.length + ' check(s) failed:\\n  - ' + failures.join('\\n  - '));
  }
  console.log('[commands-test] PASS — all command checks green');
};
`,
);

try {
  await runTests({
    extensionDevelopmentPath,
    extensionTestsPath: testRunnerDir,
    launchArgs: [workdir, '--disable-extensions'],
  });
  process.stdout.write('[commands-test] PASS (vs code exit code 0)\n');
} catch (error) {
  process.stderr.write(`[commands-test] FAIL: ${error?.message ?? error}\n`);
  process.exit(1);
}
