import * as vscode from 'vscode';
import { readGraph } from '@arrows-code/format-json';
import { validate as validateGraph } from '../validator';
import { resolveDocument } from './helpers';

const SEVERITY: Record<string, vscode.DiagnosticSeverity> = {
  error: vscode.DiagnosticSeverity.Error,
  warning: vscode.DiagnosticSeverity.Warning,
};

export function makeValidate(diagnostics: vscode.DiagnosticCollection) {
  return async function validate(arg?: unknown): Promise<void> {
    const document = await resolveDocument(arg);
    if (!document) return;
    const { graph, diagnostics: parseDiags } = readGraph(document.getText());
    const all = [...parseDiags, ...validateGraph(graph)];
    const vscDiags = all.map((d) => {
      const diag = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 1),
        d.message,
        SEVERITY[d.severity] ?? vscode.DiagnosticSeverity.Information
      );
      diag.code = d.code;
      diag.source = 'arrows';
      return diag;
    });
    diagnostics.set(document.uri, vscDiags);
    void vscode.window.showInformationMessage(
      vscDiags.length === 0
        ? 'Arrows: no issues found.'
        : `Arrows: ${vscDiags.length} issue(s) - see Problems panel.`
    );
  };
}
