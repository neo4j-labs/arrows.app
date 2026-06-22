import { readGraph } from '@arrows-code/format-json';
import { pickAndRename, resolveDocument } from './helpers';

export async function renameLabel(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  const { graph } = readGraph(document.getText());
  const labels = [...new Set(graph.nodes.flatMap((n) => n.labels))].sort();
  await pickAndRename(document, labels, 'label', (oldLabel, newLabel) => ({
    type: 'renameLabel', oldLabel, newLabel,
  }));
}

export async function renameRelType(arg?: unknown): Promise<void> {
  const document = await resolveDocument(arg);
  if (!document) return;
  const { graph } = readGraph(document.getText());
  const types = [...new Set(graph.relationships.map((r) => r.type))].sort();
  await pickAndRename(document, types, 'relationship type', (oldType, newType) => ({
    type: 'renameRelType', oldType, newType,
  }));
}
