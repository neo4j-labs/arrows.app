import * as vscode from 'vscode';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const FORMAT_SHORTCUT = process.platform === 'darwin' ? '⇧⌥F' : 'Shift+Alt+F';

type Item =
  | { kind: 'workspace-file'; label: string; uri: vscode.Uri }
  | { kind: 'example'; label: string; uri: vscode.Uri; description?: string }
  | { kind: 'section'; label: string; section: 'actions' | 'workspace' | 'examples'; icon: string; tooltip: string }
  | { kind: 'empty'; label: string }
  | { kind: 'action'; label: string; description?: string; command: string; icon: string; tooltip: string };

export class ArrowsTreeDataProvider implements vscode.TreeDataProvider<Item> {
  private readonly _onDidChange = new vscode.EventEmitter<Item | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChange.event;

  private disposables: vscode.Disposable[] = [];

  constructor(private readonly examplesDir: string) {
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.arrows');
    this.disposables.push(
      watcher,
      watcher.onDidCreate(() => this.refresh()),
      watcher.onDidDelete(() => this.refresh()),
    );
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }

  refresh(): void {
    this._onDidChange.fire();
  }

  getTreeItem(item: Item): vscode.TreeItem {
    switch (item.kind) {
      case 'section': {
        const it = new vscode.TreeItem(item.label, vscode.TreeItemCollapsibleState.Expanded);
        it.iconPath = new vscode.ThemeIcon(item.icon);
        it.tooltip = item.tooltip;
        it.contextValue = `arrows.section.${item.section}`;
        return it;
      }
      case 'workspace-file': {
        const it = new vscode.TreeItem(item.label, vscode.TreeItemCollapsibleState.None);
        it.resourceUri = item.uri;
        it.tooltip = item.uri.fsPath;
        it.description = vscode.workspace.asRelativePath(item.uri);
        it.iconPath = new vscode.ThemeIcon('graph');
        it.command = { command: 'vscode.openWith', title: 'Open', arguments: [item.uri, 'arrows.preview'] };
        it.contextValue = 'arrows.workspace-file';
        return it;
      }
      case 'example': {
        const it = new vscode.TreeItem(item.label, vscode.TreeItemCollapsibleState.None);
        it.resourceUri = item.uri;
        it.tooltip = `Use "${item.label}" as a template for a new graph in your workspace`;
        it.description = item.description;
        it.iconPath = new vscode.ThemeIcon('book');
        // Clicking an example copies it into the workspace rather than opening
        // the read-only bundled file. Users expect "use as template" by default.
        it.command = { command: 'arrows.newFromExample', title: 'Use as template', arguments: [item.uri] };
        it.contextValue = 'arrows.example';
        return it;
      }
      case 'action': {
        const it = new vscode.TreeItem(item.label, vscode.TreeItemCollapsibleState.None);
        it.iconPath = new vscode.ThemeIcon(item.icon);
        it.description = item.description;
        it.tooltip = item.tooltip;
        it.command = { command: item.command, title: item.label };
        it.contextValue = 'arrows.quick-action';
        return it;
      }
      case 'empty': {
        const it = new vscode.TreeItem(item.label, vscode.TreeItemCollapsibleState.None);
        it.iconPath = new vscode.ThemeIcon('info');
        return it;
      }
    }
  }

  async getChildren(parent?: Item): Promise<Item[]> {
    if (!parent) {
      return [
        { kind: 'section', label: 'Quick actions',      section: 'actions',   icon: 'rocket',        tooltip: 'Common arrows commands' },
        { kind: 'section', label: 'In this workspace', section: 'workspace', icon: 'folder-opened', tooltip: '.arrows files found in the open workspace' },
        { kind: 'section', label: 'Examples',          section: 'examples',  icon: 'library',       tooltip: 'Click any example to copy it into your workspace as a new graph' },
      ];
    }
    if (parent.kind === 'section' && parent.section === 'actions') {
      return [
        { kind: 'action', label: 'New graph',             command: 'arrows.newGraph',         icon: 'add',               tooltip: 'Open a new untitled .arrows file in the canvas editor' },
        { kind: 'action', label: 'New from example…',     command: 'arrows.newFromExample',   icon: 'library',           tooltip: 'Pick a bundled example and copy it into your workspace' },
        { kind: 'action', label: 'Import from URL / JSON…', command: 'arrows.import',          icon: 'cloud-download',    tooltip: 'Paste an arrows.app share URL or raw .arrows JSON to save it as a file in this workspace' },
        { kind: 'action', label: 'Validate active graph', command: 'arrows.validate',         icon: 'check',             tooltip: 'Run the structural validator on the open .arrows file' },
        { kind: 'action', label: 'Format active graph',   command: 'arrows.format',           icon: 'symbol-namespace',  description: FORMAT_SHORTCUT, tooltip: 'Sort keys and normalize whitespace in the open .arrows file' },
        { kind: 'action', label: 'Copy as Cypher',        command: 'arrows.copyCypher',       icon: 'clippy',            tooltip: 'Copy the active graph as Cypher CREATE statements to the clipboard' },
        { kind: 'action', label: 'Open in arrows.app',    command: 'arrows.openInArrowsApp',  icon: 'link-external',     tooltip: 'Open the active graph in the arrows.app web editor (loads via URL hash)' },
        { kind: 'action', label: 'Export as SVG…',        command: 'arrows.exportSvg',        icon: 'file-media',        tooltip: 'Render the active graph as SVG and save it to a file' },
      ];
    }
    if (parent.kind === 'section' && parent.section === 'workspace') {
      const files = await vscode.workspace.findFiles('**/*.arrows', '**/node_modules/**', 200);
      if (files.length === 0) {
        return [{ kind: 'empty', label: 'No .arrows files yet — try Quick actions → New graph' }];
      }
      files.sort((a, b) => a.fsPath.localeCompare(b.fsPath));
      return files.map((uri) => ({
        kind: 'workspace-file',
        label: uri.path.split('/').pop() ?? uri.fsPath,
        uri,
      }));
    }
    if (parent.kind === 'section' && parent.section === 'examples') {
      if (!existsSync(this.examplesDir)) {
        return [{ kind: 'empty', label: 'Examples not bundled with this build' }];
      }
      const names = readdirSync(this.examplesDir).filter((f) => f.endsWith('.arrows')).sort();
      return names.map((name) => ({
        kind: 'example',
        label: name.replace(/\.arrows$/, ''),
        description: 'bundled',
        uri: vscode.Uri.file(join(this.examplesDir, name)),
      }));
    }
    return [];
  }
}

export function registerSidebar(context: vscode.ExtensionContext): void {
  const examplesDir = vscode.Uri.joinPath(context.extensionUri, 'media', 'examples').fsPath;
  const provider = new ArrowsTreeDataProvider(examplesDir);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('arrowsExplorer', provider),
    vscode.commands.registerCommand('arrows.sidebar.refresh', () => provider.refresh()),
    { dispose: () => provider.dispose() },
  );
}
