import * as vscode from 'vscode';
import { readGraph, writeGraph } from '@arrows-code/format-json';
import {
  cypherClauseItems,
  LAST_CYPHER_CLAUSE_KEY,
  type CypherClause,
  type CypherClauseItem,
} from '../cypherClause';
import { ArrowsPreviewProvider } from '../PreviewProvider';
import { msg, resolveDocument, saveExport } from './helpers';

function makeExport(
  ext: string,
  filters: Record<string, string[]>,
  label: string,
  produce: (doc: vscode.TextDocument) => Promise<string>
) {
  return async (arg?: unknown): Promise<void> => {
    const doc = await resolveDocument(arg);
    if (!doc) return;
    try {
      await saveExport(doc, ext, filters, await produce(doc));
    } catch (error) {
      void vscode.window.showErrorMessage(`Arrows: ${label} export failed: ${msg(error)}`);
    }
  };
}

export const exportSvg = makeExport(
  'svg',
  { 'SVG image': ['svg'] },
  'SVG',
  (doc) => ArrowsPreviewProvider.requestSvg(doc.uri)
);

export const exportGraphQL = makeExport(
  'graphql',
  { GraphQL: ['graphql', 'gql'] },
  'GraphQL',
  (doc) => ArrowsPreviewProvider.requestGraphQL(doc.uri)
);

async function pickCypherClause(
  context: vscode.ExtensionContext
): Promise<CypherClause | undefined> {
  const last = context.workspaceState.get<CypherClause>(LAST_CYPHER_CLAUSE_KEY);
  const { items, active } = cypherClauseItems(last);
  const pick = await vscode.window.showQuickPick(items, {
    title: 'Cypher clause',
    placeHolder: 'Pick a clause',
    matchOnDetail: true,
    ...(active ? ({ activeItem: active } as { activeItem: CypherClauseItem }) : {}),
  });
  if (!pick) return undefined;
  await context.workspaceState.update(LAST_CYPHER_CLAUSE_KEY, pick.clause);
  return pick.clause;
}

export function makeExportCypher(context: vscode.ExtensionContext) {
  return async (arg?: unknown): Promise<void> => {
    const document = await resolveDocument(arg);
    if (!document) return;
    const clause = await pickCypherClause(context);
    if (!clause) return;
    try {
      const cypher = await ArrowsPreviewProvider.requestCypher(document.uri, clause);
      await saveExport(document, 'cypher', { Cypher: ['cypher', 'cql'] }, cypher);
    } catch (error) {
      void vscode.window.showErrorMessage(`Arrows: Cypher export failed: ${msg(error)}`);
    }
  };
}

export function makeCopyCypher(context: vscode.ExtensionContext) {
  return async (arg?: unknown): Promise<void> => {
    const document = await resolveDocument(arg);
    if (!document) return;
    const clause = await pickCypherClause(context);
    if (!clause) return;
    try {
      const cypher = await ArrowsPreviewProvider.requestCypher(document.uri, clause);
      await vscode.env.clipboard.writeText(cypher);
      void vscode.window.showInformationMessage(`Arrows: ${clause} Cypher copied to clipboard.`);
    } catch (error) {
      void vscode.window.showErrorMessage(`Arrows: Cypher export failed: ${msg(error)}`);
    }
  };
}

// Safari URL limit ~80KB; warn above 20KB but allow.
const ARROWS_APP_URL_WARN_BYTES = 20_000;

export async function openInArrowsApp(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  const { graph, diagnostics } = readGraph(document.getText());
  if (diagnostics.some((d) => d.severity === 'error')) {
    void vscode.window.showWarningMessage('Arrows: cannot share — document does not parse cleanly.');
    return;
  }
  const json = writeGraph(graph);
  if (json.length > ARROWS_APP_URL_WARN_BYTES) {
    const choice = await vscode.window.showWarningMessage(
      `Arrows: graph is ${Math.round(json.length / 1024)} KB. Some browsers may reject the URL.`,
      { modal: false },
      'Open anyway',
      'Cancel'
    );
    if (choice !== 'Open anyway') return;
  }
  const b64 = Buffer.from(json, 'utf8').toString('base64');
  const url = `https://arrows.app/#/import/json=${encodeURIComponent(b64)}`;
  const opened = await vscode.env.openExternal(vscode.Uri.parse(url));
  if (!opened) {
    void vscode.window.showWarningMessage('Arrows: could not open external browser.');
  }
}
