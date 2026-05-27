// Single source of truth for the extension's command surface. The three places
// that USE this list — TOOLBAR_COMMANDS allowlist in PreviewProvider, sidebar
// Quick actions, and the embed canvas dropdown menu — all read from here so
// adding or renaming a command in one place doesn't silently miss the others.
//
// Naming rules: short, no "active graph" filler, parallel verbs across the set
// (Copy ↔ Save ↔ Open). The category "Arrows" is added by VS Code in the
// palette, so titles don't repeat it.

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
  },
  {
    id: 'arrows.openSource',
    title: 'Show JSON side by side',
    icon: 'split-horizontal',
    description: 'Open the JSON in a side panel',
    webview: true,
    surface: { sidebar: false, embedMenu: true },
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
}

export function embedMenuPayload(): EmbedMenuEntry[] {
  return COMMANDS.filter((c) => c.surface.embedMenu && c.webview).map(
    ({ id, title, description, icon }) => ({ id, title, description, icon })
  );
}
