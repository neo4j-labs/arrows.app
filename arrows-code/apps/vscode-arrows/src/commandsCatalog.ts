// Single source of truth for the command surface - read by PreviewProvider's
// allowlist, sidebar quick actions, and the embed dropdown.

export interface ArrowsCommand {
  id: string;
  /** Short label shown in menus. */
  title: string;
  /** Codicon name for the sidebar; rendered as text in the embed dropdown. */
  icon: string;
  /** One-line hover description. */
  description: string;
  /** Embed canvas is allowed to invoke this via the postMessage `command` channel. */
  webview: boolean;
  /** Which user-facing surfaces show this command. */
  surface: { sidebar: boolean; embedMenu: boolean };
  /** Bound chord shown inline in the dropdown. Embed renders via shortcut(). */
  shortcut?: { mod?: 'cmd' | 'cmd+shift' | 'shift+alt'; key: string };
}

export const COMMANDS: ArrowsCommand[] = [
  {
    id: 'arrows.newGraph',
    title: 'New graph',
    icon: 'add',
    description: 'New untitled graph',
    webview: false,
    surface: { sidebar: true, embedMenu: false },
  },
  {
    id: 'arrows.newFromExample',
    title: 'New from example…',
    icon: 'library',
    description: 'Copy a bundled graph here',
    webview: false,
    surface: { sidebar: true, embedMenu: false },
  },
  {
    id: 'arrows.import',
    title: 'Import shared graph…',
    icon: 'cloud-download',
    description: 'Paste an arrows.app URL or JSON',
    webview: false,
    surface: { sidebar: true, embedMenu: false },
  },
  {
    id: 'arrows.validate',
    title: 'Validate graph',
    icon: 'check',
    description: 'Check IDs, refs, style keys',
    webview: true,
    surface: { sidebar: false, embedMenu: true },
  },
  {
    id: 'arrows.format',
    title: 'Auto-arrange nodes…',
    icon: 'symbol-namespace',
    description: 'Pick a layout: force, hierarchical, radial, circular, grid',
    webview: true,
    surface: { sidebar: false, embedMenu: true },
    shortcut: { mod: 'shift+alt', key: 'F' },
  },
  {
    id: 'arrows.openSource',
    title: 'Show JSON side by side',
    icon: 'split-horizontal',
    description: 'Open the JSON in a side panel',
    webview: true,
    surface: { sidebar: false, embedMenu: true },
    shortcut: { mod: 'cmd', key: 'K V' },
  },
  {
    id: 'arrows.copyCypher',
    title: 'Copy Cypher to clipboard',
    icon: 'clippy',
    description: 'Copy as Cypher CREATE',
    webview: true,
    surface: { sidebar: false, embedMenu: true },
  },
  {
    id: 'arrows.exportCypher',
    title: 'Save as Cypher…',
    icon: 'database',
    description: 'Save as .cypher',
    webview: true,
    surface: { sidebar: false, embedMenu: true },
  },
  {
    id: 'arrows.exportSvg',
    title: 'Save as SVG…',
    icon: 'file-media',
    description: 'Save as SVG',
    webview: true,
    surface: { sidebar: false, embedMenu: true },
  },
  {
    id: 'arrows.exportGraphQL',
    title: 'Save as GraphQL schema…',
    icon: 'graph',
    description: 'Export the graph shape as a GraphQL schema',
    webview: true,
    surface: { sidebar: false, embedMenu: true },
  },
  {
    id: 'arrows.openInArrowsApp',
    title: 'Open in arrows.app',
    icon: 'link-external',
    description: 'Open this graph in arrows.app',
    webview: true,
    surface: { sidebar: false, embedMenu: true },
  },
  {
    id: 'arrows.renameLabel',
    title: 'Rename label…',
    icon: 'symbol-key',
    description: 'Rename a label everywhere',
    webview: true,
    surface: { sidebar: false, embedMenu: true },
  },
  {
    id: 'arrows.renameRelType',
    title: 'Rename relationship type…',
    icon: 'arrow-swap',
    description: 'Rename a relationship type everywhere',
    webview: true,
    surface: { sidebar: false, embedMenu: true },
  },
  {
    id: 'arrows.openTutorial',
    title: 'Watch tutorial',
    icon: 'play',
    description: 'Open the arrows.app intro video in your browser',
    webview: true,
    surface: { sidebar: false, embedMenu: false },
  },
];

export const webviewAllowedCommandIds: ReadonlySet<string> = new Set(
  COMMANDS.filter((c) => c.webview).map((c) => c.id)
);

export function sidebarQuickActions(): readonly ArrowsCommand[] {
  return COMMANDS.filter((c) => c.surface.sidebar);
}

export interface EmbedMenuEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  shortcut?: ArrowsCommand['shortcut'];
}

export function embedMenuPayload(): EmbedMenuEntry[] {
  return COMMANDS.filter((c) => c.surface.embedMenu && c.webview).map(
    ({ id, title, description, icon, shortcut }) => ({ id, title, description, icon, shortcut })
  );
}
