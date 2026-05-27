import { useEffect, useRef, useState } from 'react';
import type { EmbedMenuEntry } from './bridge';
import { Tooltip } from './Tooltip';
import { shortcut } from './platformKeys';

// Reads the menu entries the host posted into `window.__arrowsMenu` and renders
// a dropdown anchored to the toolbar. Single source of truth is
// arrows-code/apps/vscode-arrows/src/commandsCatalog.ts.
type HostPost = (m: { type: string; [k: string]: unknown }) => void;
const postToHost: HostPost = (msg) => {
  const w = window as unknown as { __arrowsHostPost?: HostPost };
  try {
    if (w.__arrowsHostPost) w.__arrowsHostPost(msg);
    else window.parent.postMessage(msg, '*');
  } catch {
    /* host channel unavailable */
  }
};

function useMenuEntries(): EmbedMenuEntry[] {
  const [entries, setEntries] = useState<EmbedMenuEntry[]>(() => {
    const w = window as unknown as { __arrowsMenu?: EmbedMenuEntry[] };
    return w.__arrowsMenu ?? [];
  });
  useEffect(() => {
    const refresh = () => {
      const w = window as unknown as { __arrowsMenu?: EmbedMenuEntry[] };
      setEntries(w.__arrowsMenu ?? []);
    };
    window.addEventListener('__arrowsMenu', refresh);
    return () => window.removeEventListener('__arrowsMenu', refresh);
  }, []);
  return entries;
}

export function EmbedActionMenu(): JSX.Element | null {
  const entries = useMenuEntries();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  if (entries.length === 0) return null;

  const run = (id: string) => () => {
    postToHost({ type: 'command', name: id });
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <Tooltip label="More commands">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setOpen((v) => !v)}
          style={{
            border: 'none',
            background: open ? '#e7eefe' : 'transparent',
            padding: '6px 10px',
            cursor: 'pointer',
            color: open ? '#1664d9' : '#333',
            borderRadius: 3,
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          <KebabIcon />
        </button>
      </Tooltip>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 10000,
            background: 'var(--vscode-menu-background, #1f1f1f)',
            border: '1px solid var(--vscode-menu-border, #454545)',
            borderRadius: 4,
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
            minWidth: 220,
            fontFamily: 'var(--vscode-font-family, sans-serif)',
            fontSize: 13,
            padding: '4px 0',
            userSelect: 'none',
          }}
        >
          {entries.map((cmd) => (
            <div
              key={cmd.id}
              role="menuitem"
              title={cmd.description}
              onClick={run(cmd.id)}
              style={{
                padding: '6px 14px',
                cursor: 'pointer',
                color: 'var(--vscode-menu-foreground, #cccccc)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'var(--vscode-menu-selectionBackground, #094771)';
                e.currentTarget.style.color =
                  'var(--vscode-menu-selectionForeground, #ffffff)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color =
                  'var(--vscode-menu-foreground, #cccccc)';
              }}
            >
              <MenuIcon name={cmd.icon} />
              <span style={{ flex: 1 }}>{cmd.title}</span>
              {cmd.shortcut && (
                <span style={{ fontSize: 11, opacity: 0.65, fontFamily: 'monospace' }}>
                  {shortcut(cmd.shortcut)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const KebabIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="5" r="1.4" />
    <circle cx="12" cy="12" r="1.4" />
    <circle cx="12" cy="19" r="1.4" />
  </svg>
);

const ICON_PATHS: Record<string, JSX.Element> = {
  check: <polyline points="20 6 9 17 4 12" />,
  'symbol-namespace': (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ),
  'split-horizontal': (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </>
  ),
  clippy: (
    <>
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M9 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-4" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5" />
      <path d="M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6" />
    </>
  ),
  'file-media': (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-5-5L5 21" />
    </>
  ),
  'link-external': (
    <>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
    </>
  ),
  'symbol-key': (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="M10.85 12.15 19 4" />
      <path d="m18 5 3 3" />
      <path d="m15 8 3 3" />
    </>
  ),
  'arrow-swap': (
    <>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </>
  ),
  graph: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="7" y1="8" x2="11" y2="16" />
      <line x1="17" y1="8" x2="13" y2="16" />
    </>
  ),
};

const MenuIcon = ({ name }: { name?: string }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flex: '0 0 14px', opacity: 0.75 }}
    aria-hidden="true"
  >
    {(name && ICON_PATHS[name]) ?? <circle cx="12" cy="12" r="2" />}
  </svg>
);
