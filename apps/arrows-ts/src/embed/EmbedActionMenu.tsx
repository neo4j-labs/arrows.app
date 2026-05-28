import { useEffect, useState } from 'react';
import { Button, Popup, Menu, Icon } from 'semantic-ui-react';
import type { EmbedMenuEntry } from './bridge';
import { shortcut } from './platformKeys';
import { embedWindow, postToHost } from './hostPost';

// Reads menu entries the host posted into `window.__arrowsMenu` and renders
// the kebab dropdown. Single source of truth is
// arrows-code/apps/vscode-arrows/src/commandsCatalog.ts.

const readMenu = (): EmbedMenuEntry[] =>
  (embedWindow().__arrowsMenu as EmbedMenuEntry[] | undefined) ?? [];

function useMenuEntries(): EmbedMenuEntry[] {
  const [entries, setEntries] = useState<EmbedMenuEntry[]>(readMenu);
  useEffect(() => {
    const refresh = (): void => setEntries(readMenu());
    window.addEventListener('__arrowsMenu', refresh);
    return () => window.removeEventListener('__arrowsMenu', refresh);
  }, []);
  return entries;
}

const SEMANTIC_ICON_MAP: Record<string, string> = {
  check: 'check',
  'symbol-namespace': 'sitemap',
  'split-horizontal': 'columns',
  clippy: 'copy',
  database: 'database',
  'file-media': 'image',
  'link-external': 'external alternate',
  'symbol-key': 'tag',
  'arrow-swap': 'exchange',
  graph: 'share alternate',
};

export function EmbedActionMenu(): JSX.Element | null {
  const entries = useMenuEntries();
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  const run = (id: string) => (): void => {
    postToHost({ type: 'command', name: id });
    setOpen(false);
  };

  return (
    <Popup
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      on="click"
      position="bottom right"
      trigger={
        <Button icon basic title="More commands">
          <Icon name="ellipsis vertical" />
        </Button>
      }
      style={{ padding: 0 }}
    >
      <Menu vertical secondary style={{ margin: 0, minWidth: 220 }}>
        {entries.map((cmd) => {
          const tooltip = cmd.shortcut
            ? `${cmd.description}  (${shortcut(cmd.shortcut)})`
            : cmd.description;
          return (
            <Menu.Item key={cmd.id} onClick={run(cmd.id)} title={tooltip}>
              <Icon name={(SEMANTIC_ICON_MAP[cmd.icon ?? ''] ?? 'circle') as never} />
              <span>{cmd.title}</span>
            </Menu.Item>
          );
        })}
      </Menu>
    </Popup>
  );
}
