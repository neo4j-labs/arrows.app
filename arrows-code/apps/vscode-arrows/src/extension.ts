import * as vscode from 'vscode';
import { ArrowsPreviewProvider } from './PreviewProvider';
import { registerSidebar } from './sidebar';
import {
  deleteFile,
  openInArrowsApp,
  exportGraphQL,
  exportSvg,
  getDiagnosticCollection,
  makeCopyCypher,
  makeExportCypher,
  makeFormat,
  importGraph,
  makeNewFromExample,
  newGraph,
  openFile,
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
      {
        webviewOptions: { retainContextWhenHidden: true },
        supportsMultipleEditorsPerDocument: false,
      }
    ),
    cmd('arrows.newGraph', newGraph),
    cmd('arrows.openFile', openFile),
    cmd('arrows.newFromExample', makeNewFromExample(context)),
    cmd('arrows.import', importGraph),
    cmd('arrows.openSource', openSource),
    cmd('arrows.openPreviewToSide', openPreviewToSide),
    cmd('arrows.format', makeFormat(context)),
    cmd('arrows.validate', validate),
    cmd('arrows.exportSvg', exportSvg),
    cmd('arrows.exportGraphQL', exportGraphQL),
    cmd('arrows.exportCypher', makeExportCypher(context)),
    cmd('arrows.copyCypher', makeCopyCypher(context)),
    cmd('arrows.openInArrowsApp', openInArrowsApp),
    cmd('arrows.renameLabel', renameLabel),
    cmd('arrows.renameRelType', renameRelType),
    cmd('arrows.deleteFile', deleteFile),
    getDiagnosticCollection()
  );

  registerSidebar(context);
}
