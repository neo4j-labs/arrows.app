#!/usr/bin/env node
/**
 * Boot real VS Code with the extension loaded from source and:
 *   1. activate, confirm command registration
 *   2. open the fixture with the custom preview editor (mounts the
 *      arrows-ts embed bundle in the webview)
 *   3. wait briefly; ensure the extension is still alive (no async crash
 *      from the webview)
 *
 * The bridge handshake (postMessage ↔ Redux) can't be asserted from the
 * extension host without a full webview test harness — we rely on the
 * manual gauntlet for that. This script is the cheapest gate that catches
 * extension-host load errors before .vsix package.
 */
import { runTests } from '@vscode/test-electron';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extensionDevelopmentPath = resolve(__dirname, '..');
const fixturePath = resolve(__dirname, '..', '..', '..', 'fixtures', 'examples', 'social.arrows');
const embedHtml = resolve(__dirname, '..', 'media', 'embed', 'embed.html');
const testRunnerDir = resolve(__dirname, '..', 'dist', 'load-test-runner');
mkdirSync(testRunnerDir, { recursive: true });

if (!existsSync(embedHtml)) {
  process.stderr.write(`[load-test] FAIL: media/embed/embed.html missing — run build first\n`);
  process.exit(1);
}

const runnerPath = resolve(testRunnerDir, 'index.js');
writeFileSync(
  runnerPath,
  `
const vscode = require('vscode');

exports.run = async function () {
  const ext = vscode.extensions.getExtension('neo4j-labs.arrows-code-vscode-arrows');
  if (!ext) throw new Error('Extension not found in VS Code registry');
  await ext.activate();

  const commands = await vscode.commands.getCommands(true);
  const ours = commands.filter((c) => c.startsWith('arrows.') && !c.startsWith('arrows._'));
  if (ours.length < 5) throw new Error('Expected ≥5 arrows.* commands, got ' + ours.length);
  console.log('[load-test] activate OK — ' + ours.length + ' commands');

  const uri = vscode.Uri.file(${JSON.stringify(fixturePath)});
  await vscode.commands.executeCommand('vscode.openWith', uri, 'arrows.preview');
  await new Promise((r) => setTimeout(r, 2500));

  // Confirm the editor stayed open (webview didn't crash the host).
  const editors = vscode.window.tabGroups.all.flatMap((g) => g.tabs).filter((t) => {
    const inp = t.input;
    return inp && inp.uri && inp.uri.fsPath === ${JSON.stringify(fixturePath)};
  });
  if (editors.length === 0) throw new Error('preview tab no longer open after 2.5s — webview likely crashed');
  console.log('[load-test] webview alive — preview tab present');
  console.log('[load-test] PASS');
};
`,
);

try {
  await runTests({
    extensionDevelopmentPath,
    extensionTestsPath: testRunnerDir,
    launchArgs: ['--disable-extensions'],
  });
  process.stdout.write('[load-test] PASS (vs code exit code 0)\n');
} catch (error) {
  process.stderr.write(`[load-test] FAIL: ${error?.message ?? error}\n`);
  process.exit(1);
}
