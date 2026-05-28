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
function check(label, cond) {
  if (cond) { console.log('  ✓ ' + label); }
  else { failures.push(label); console.log('  ✗ ' + label); }
}

async function openFixture() {
  const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(fixturePath));
  await vscode.window.showTextDocument(doc, { preview: false });
  return doc;
}

function stub(obj, key, fn) {
  const original = obj[key];
  obj[key] = fn;
  return () => { obj[key] = original; };
}

exports.run = async function () {
  const ext = vscode.extensions.getExtension('neo4j-labs.arrows-code-vscode-arrows');
  if (!ext) throw new Error('Extension not loaded');
  await ext.activate();

  console.log('\\n▸ arrows.newGraph');
  await vscode.commands.executeCommand('arrows.newGraph');
  const untitled = vscode.workspace.textDocuments.find((d) => d.uri.scheme === 'untitled');
  check('opens an untitled .arrows document with the starter template', !!untitled && /"Alice"/.test(untitled.getText()));

  console.log('\\n▸ arrows.format');
  {
    const doc = await openFixture();
    await vscode.commands.executeCommand('arrows.format', doc.uri);
    try { JSON.parse(doc.getText()); check('produces parseable JSON', true); }
    catch { check('produces parseable JSON', false); }
  }

  console.log('\\n▸ arrows.validate');
  {
    const doc = await openFixture();
    let shown = false;
    const restore = stub(vscode.window, 'showInformationMessage', async () => { shown = true; });
    try { await vscode.commands.executeCommand('arrows.validate', doc.uri); } finally { restore(); }
    check('shows a status message', shown);
  }

  console.log('\\n▸ arrows.copyCypher');
  {
    const doc = await openFixture();
    await vscode.commands.executeCommand('arrows.copyCypher', doc.uri);
    const clip = await vscode.env.clipboard.readText();
    check('clipboard contains a CREATE statement', /CREATE/.test(clip));
  }

  console.log('\\n▸ arrows.exportCypher');
  {
    const doc = await openFixture();
    const target = vscode.Uri.file(path.join(workdir, 'export-test.cypher'));
    const restore = stub(vscode.window, 'showSaveDialog', async () => target);
    try { await vscode.commands.executeCommand('arrows.exportCypher', doc.uri); } finally { restore(); }
    check('writes a Cypher file with CREATE', fs.existsSync(target.fsPath) && /CREATE/.test(fs.readFileSync(target.fsPath, 'utf8')));
  }

  console.log('\\n▸ arrows.exportSvg');
  {
    const doc = await openFixture();
    const target = vscode.Uri.file(path.join(workdir, 'export-test.svg'));
    const restore = stub(vscode.window, 'showSaveDialog', async () => target);
    try { await vscode.commands.executeCommand('arrows.exportSvg', doc.uri); } finally { restore(); }
    check('writes an SVG file', fs.existsSync(target.fsPath) && /<svg/.test(fs.readFileSync(target.fsPath, 'utf8')));
  }

  console.log('\\n▸ arrows.renameLabel');
  {
    const doc = await openFixture();
    const restoreQp = stub(vscode.window, 'showQuickPick', async () => 'Person');
    const restoreIb = stub(vscode.window, 'showInputBox', async () => 'Customer');
    try { await vscode.commands.executeCommand('arrows.renameLabel', doc.uri); }
    finally { restoreQp(); restoreIb(); }
    await new Promise((r) => setTimeout(r, 200));
    check('rewrites the label in the document', doc.getText().includes('"Customer"'));
  }

  console.log('\\n▸ arrows.renameRelType');
  {
    const doc = await openFixture();
    const restoreQp = stub(vscode.window, 'showQuickPick', async () => 'KNOWS');
    const restoreIb = stub(vscode.window, 'showInputBox', async () => 'FOLLOWS');
    try { await vscode.commands.executeCommand('arrows.renameRelType', doc.uri); }
    finally { restoreQp(); restoreIb(); }
    await new Promise((r) => setTimeout(r, 200));
    check('rewrites the relationship type', doc.getText().includes('"FOLLOWS"'));
  }

  console.log('\\n▸ arrows.newFromExample');
  {
    const ext = vscode.extensions.getExtension('neo4j-labs.arrows-code-vscode-arrows');
    const exampleUri = vscode.Uri.file(path.join(ext.extensionPath, 'media', 'examples', 'social.arrows'));
    const target = path.join(workdir, 'from-template.arrows');
    const restoreQp = stub(vscode.window, 'showQuickPick', async () => ({ label: 'social', uri: exampleUri }));
    const restoreSd = stub(vscode.window, 'showSaveDialog', async () => vscode.Uri.file(target));
    try { await vscode.commands.executeCommand('arrows.newFromExample'); }
    finally { restoreQp(); restoreSd(); }
    check('copies a bundled example into the chosen target', fs.existsSync(target));
  }

  console.log('\\n▸ arrows.openInArrowsApp');
  {
    const doc = await openFixture();
    let opened = null;
    const restore = stub(vscode.env, 'openExternal', async (uri) => { opened = uri; return true; });
    try { await vscode.commands.executeCommand('arrows.openInArrowsApp', doc.uri); } finally { restore(); }
    check('opens an arrows.app URL with an import payload',
      !!opened && opened.authority === 'arrows.app' && opened.fragment.startsWith('/import/json='));
  }

  console.log('\\n▸ arrows.deleteFile');
  {
    const victim = path.join(workdir, 'delete-me.arrows');
    fs.writeFileSync(victim, '{}');
    const restore = stub(vscode.window, 'showWarningMessage', async () => 'Delete');
    try { await vscode.commands.executeCommand('arrows.deleteFile', vscode.Uri.file(victim)); } finally { restore(); }
    check('removes the file from disk', !fs.existsSync(victim));
  }

  console.log('\\n▸ arrows.openPreviewToSide');
  {
    await openFixture();
    await vscode.commands.executeCommand('arrows.openPreviewToSide', vscode.Uri.file(fixturePath));
    await new Promise((r) => setTimeout(r, 500));
    const tabs = vscode.window.tabGroups.all.flatMap((g) => g.tabs);
    check('opens a preview tab', tabs.some((t) => t.input && t.input.viewType === 'arrows.preview'));
  }

  console.log('\\n▸ arrows.openSource + arrows.sidebar.refresh do not throw');
  let threw = false;
  try {
    await vscode.commands.executeCommand('arrows.openSource', vscode.Uri.file(fixturePath));
    await vscode.commands.executeCommand('arrows.sidebar.refresh');
  } catch { threw = true; }
  check('both run without throwing', !threw);

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
