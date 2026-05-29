import * as vscode from 'vscode';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { sidebarQuickActions } from './commandsCatalog';
import { examplesDir } from './commands/helpers';

const FORMAT_SHORTCUT = process.platform === 'darwin' ? '⇧⌥F' : 'Shift+Alt+F';

type Item =
  | { kind: 'workspace-file'; label: string; uri: vscode.Uri }
  | { kind: 'example'; label: string; uri: vscode.Uri; description?: string }
  | { kind: 'section'; label: string; section: 'actions' | 'workspace' | 'examples'; icon: string; tooltip: string }
  | { kind: 'empty'; label: string }
  | { kind: 'action'; label: string; description?: string; command: string; icon: string; tooltip: string };

const None = vscode.TreeItemCollapsibleState.None;
const Expanded = vscode.TreeItemCollapsibleState.Expanded;
const SECTIONS: Array<Item & { kind: 'section' }> = [
  { kind: 'section', label: 'Quick actions', section: 'actions', icon: 'rocket', tooltip: 'What the buttons do' },
  { kind: 'section', label: 'In this workspace', section: 'workspace', icon: 'folder-opened', tooltip: '.arrows files in this workspace' },
  { kind: 'section', label: 'Examples', section: 'examples', icon: 'library', tooltip: 'Click one to start a new graph from it' },
];
const WORKSPACE_EXCLUDE =
  '{**/node_modules/**,**/dist/**,**/.vscode-test/**,**/media/examples/**,**/out/**,**/build/**,**/.next/**,**/coverage/**}';

export class ArrowsTreeDataProvider implements vscode.TreeDataProvider<Item> {
  private readonly _onDidChange = new vscode.EventEmitter<Item | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChange.event;
  private disposables: vscode.Disposable[] = [];

  constructor(private readonly examplesDir: string) {
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.arrows');
    this.disposables.push(
      watcher,
      watcher.onDidCreate(() => this.refresh()),
      watcher.onDidDelete(() => this.refresh())
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
    const it = new vscode.TreeItem(item.label, item.kind === 'section' ? Expanded : None);
    switch (item.kind) {
      case 'section':
        it.iconPath = new vscode.ThemeIcon(item.icon);
        it.tooltip = item.tooltip;
        it.contextValue = `arrows.section.${item.section}`;
        return it;
      case 'workspace-file':
        it.resourceUri = item.uri;
        it.tooltip = item.uri.fsPath;
        it.description = vscode.workspace.asRelativePath(item.uri);
        it.iconPath = new vscode.ThemeIcon('graph');
        // Wrapper command claims focus; default tree-click leaves it on the Explorer.
        it.command = { command: 'arrows.openFile', title: 'Open', arguments: [item.uri] };
        it.contextValue = 'arrows.workspace-file';
        return it;
      case 'example':
        it.resourceUri = item.uri;
        it.tooltip = `Use "${item.label}" as a template for a new graph in your workspace`;
        it.description = item.description;
        it.iconPath = new vscode.ThemeIcon('book');
        // Click = "use as template" (copy to workspace), not open the read-only bundled file.
        it.command = { command: 'arrows.newFromExample', title: 'Use as template', arguments: [item.uri] };
        it.contextValue = 'arrows.example';
        return it;
      case 'action':
        it.iconPath = new vscode.ThemeIcon(item.icon);
        it.description = item.description;
        it.tooltip = item.tooltip;
        it.command = { command: item.command, title: item.label };
        it.contextValue = 'arrows.quick-action';
        return it;
      case 'empty':
        it.iconPath = new vscode.ThemeIcon('info');
        return it;
    }
  }

  async getChildren(parent?: Item): Promise<Item[]> {
    if (!parent) return SECTIONS;
    if (parent.kind !== 'section') return [];
    if (parent.section === 'actions') {
      return sidebarQuickActions().map((cmd) => ({
        kind: 'action',
        label: cmd.title,
        command: cmd.id,
        icon: cmd.icon,
        tooltip: cmd.description,
        description: cmd.id === 'arrows.format' ? FORMAT_SHORTCUT : undefined,
      }));
    }
    if (parent.section === 'workspace') {
      const files = await vscode.workspace.findFiles('**/*.arrows', WORKSPACE_EXCLUDE, 200);
      if (files.length === 0) {
        return [{ kind: 'empty', label: 'No .arrows files yet - try Quick actions → New graph' }];
      }
      files.sort((a, b) => a.fsPath.localeCompare(b.fsPath));
      return files.map((uri) => ({
        kind: 'workspace-file',
        label: uri.path.split('/').pop() ?? uri.fsPath,
        uri,
      }));
    }
    if (!existsSync(this.examplesDir)) {
      return [{ kind: 'empty', label: 'Examples not bundled with this build' }];
    }
    return readdirSync(this.examplesDir)
      .filter((f) => f.endsWith('.arrows'))
      .sort()
      .map((name) => ({
        kind: 'example',
        label: name.replace(/\.arrows$/, ''),
        description: 'bundled',
        uri: vscode.Uri.file(join(this.examplesDir, name)),
      }));
  }
}

export function registerSidebar(context: vscode.ExtensionContext): void {
  const provider = new ArrowsTreeDataProvider(examplesDir(context).fsPath);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('arrowsExplorer', provider),
    vscode.commands.registerCommand('arrows.sidebar.refresh', () => provider.refresh()),
    { dispose: () => provider.dispose() }
  );
}
