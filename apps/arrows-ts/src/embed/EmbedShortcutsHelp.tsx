import { useEffect } from 'react';
import { shortcut } from './platformKeys';

interface ShortcutRow {
  label: string;
  keys: string;
}

interface Group {
  name: string;
  rows: ShortcutRow[];
}

const groups = (): Group[] => [
  {
    name: 'Tools',
    rows: [
      { label: 'Select tool', keys: 'V' },
      { label: 'Pan tool', keys: 'H' },
      { label: 'Pan (hold)', keys: 'Space' },
    ],
  },
  {
    name: 'Canvas',
    rows: [
      { label: 'Add node', keys: 'Double-click empty' },
      { label: 'Draw relationship', keys: 'Drag from node ring' },
      { label: 'Add to selection', keys: 'Shift+click' },
      { label: 'Delete', keys: 'Delete / Backspace' },
      { label: 'Zoom', keys: 'Wheel' },
    ],
  },
  {
    name: 'Commands',
    rows: [
      { label: 'Show JSON side by side', keys: shortcut({ mod: 'cmd', key: 'K V' }) },
      { label: 'Auto-arrange nodes', keys: shortcut({ mod: 'shift+alt', key: 'F' }) },
      { label: 'Show this help', keys: '?' },
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function EmbedShortcutsHelp({ open, onClose }: Props): JSX.Element | null {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  if (!open) return null;

  const data = groups();

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Keyboard shortcuts"
        style={{
          background: '#fff',
          color: '#222',
          borderRadius: 6,
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
          maxWidth: 460,
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          fontFamily: 'sans-serif',
        }}
      >
        <header
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Keyboard shortcuts</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 20,
              cursor: 'pointer',
              lineHeight: 1,
              padding: 4,
              color: '#666',
            }}
          >
            ×
          </button>
        </header>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {data.map((group) => (
            <section key={group.name}>
              <h3
                style={{
                  margin: '0 0 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: '#666',
                }}
              >
                {group.name}
              </h3>
              <dl style={{ margin: 0 }}>
                {group.rows.map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                      fontSize: 13,
                    }}
                  >
                    <dt style={{ color: '#333' }}>{row.label}</dt>
                    <dd style={{ margin: 0, color: '#555', fontFamily: 'monospace', fontSize: 12 }}>
                      {row.keys}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
