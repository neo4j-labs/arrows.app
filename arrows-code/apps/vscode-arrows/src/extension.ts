import * as vscode from 'vscode';
import { ArrowsPreviewProvider } from './PreviewProvider';
import { registerSidebar } from './sidebar';
import {
  copyCypher,
  deleteFile,
  openInArrowsApp,
  exportCypherCommand,
  exportSvg,
  format,
  getDiagnosticCollection,
  importGraph,
  makeNewFromExample,
  newGraph,
  openPreviewToSide,
  openSource,
  renameLabel,
  renameRelType,
  validate,
} from './commands';

export function activate(context: vscode.ExtensionContext): void {
  const cmd = vscode.commands.registerCommand;

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'arrows.preview',
      new ArrowsPreviewProvider(context),
      { webviewOptions: { retainContextWhenHidden: true }, supportsMultipleEditorsPerDocument: false },
    ),
    cmd('arrows.newGraph', newGraph),
    cmd('arrows.newFromExample', makeNewFromExample(context)),
    cmd('arrows.import', importGraph),
    cmd('arrows.openSource', openSource),
    cmd('arrows.openPreviewToSide', openPreviewToSide),
    cmd('arrows.format', format),
    cmd('arrows.validate', validate),
    cmd('arrows.exportSvg', exportSvg),
    cmd('arrows.exportCypher', exportCypherCommand),
    cmd('arrows.copyCypher', copyCypher),
    cmd('arrows.openInArrowsApp', openInArrowsApp),
    cmd('arrows.renameLabel', renameLabel),
    cmd('arrows.renameRelType', renameRelType),
    cmd('arrows.deleteFile', deleteFile),
    getDiagnosticCollection(),
  );

  registerSidebar(context);
}
