import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import { useTool, type Tool } from './ToolContext';
import { shortcut } from './platformKeys';
import { EmbedActionMenu } from './EmbedActionMenu';
import { Tooltip } from './Tooltip';
import { EmbedShortcutsHelp } from './EmbedShortcutsHelp';

interface GraphSlice {
  past?: unknown[];
  future?: unknown[];
}

const wrap: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  left: 12,
  zIndex: 10,
  display: 'flex',
  gap: 4,
  background: 'rgba(255,255,255,0.92)',
  padding: 4,
  borderRadius: 4,
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
};

const btn = (active: boolean, disabled: boolean): React.CSSProperties => ({
  border: 'none',
  background: active ? '#e7eefe' : 'transparent',
  padding: '6px 10px',
  cursor: disabled ? 'default' : 'pointer',
  color: disabled ? '#bbb' : active ? '#1664d9' : '#333',
  borderRadius: 3,
  display: 'inline-flex',
  alignItems: 'center',
});

const divider: React.CSSProperties = {
  width: 1,
  background: '#e0e0e0',
  margin: '2px 4px',
};

const iconBase = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};
const UndoIcon = () => (
  <svg {...iconBase}>
    <path d="M9 14l-4-4 4-4M5 10h9a6 6 0 0 1 0 12h-1" />
  </svg>
);
const RedoIcon = () => (
  <svg {...iconBase}>
    <path d="M15 14l4-4-4-4M19 10h-9a6 6 0 0 0 0 12h1" />
  </svg>
);
const SelectIcon = () => (
  <svg {...iconBase}>
    <path d="M3 3l7 17 2.5-7.5L20 10z" />
  </svg>
);
const PanIcon = () => (
  <svg {...iconBase}>
    <path d="M18 11V6a2 2 0 0 0-4 0v5" />
    <path d="M14 10V4a2 2 0 0 0-4 0v6" />
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
    <path d="M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);
const HelpIcon = () => (
  <svg {...iconBase}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.5 9a2.5 2.5 0 1 1 4.5 1.5c-.8.6-1.5 1.2-1.5 2v.5" />
    <line x1="12" y1="17" x2="12" y2="17.01" />
  </svg>
);

export function EmbedToolbar(): JSX.Element {
  const dispatch = useDispatch();
  const { tool, setTool } = useTool();
  const canUndo = useSelector(
    (s: { graph: GraphSlice }) => (s.graph.past?.length ?? 0) > 0
  );
  const canRedo = useSelector(
    (s: { graph: GraphSlice }) => (s.graph.future?.length ?? 0) > 0
  );

  const choose = (t: Tool) => () => setTool(t);

  const [helpOpen, setHelpOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t?.isContentEditable) return;
      if (e.key === '?' || (e.key === '/' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setHelpOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={wrap}>
      <Tooltip label={`Undo (${shortcut({ mod: 'cmd', key: 'Z' })})`}>
        <button
          style={btn(false, !canUndo)}
          disabled={!canUndo}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => dispatch(UndoActionCreators.undo())}
        >
          <UndoIcon />
        </button>
      </Tooltip>
      <Tooltip label={`Redo (${shortcut({ mod: 'cmd+shift', key: 'Z' })})`}>
        <button
          style={btn(false, !canRedo)}
          disabled={!canRedo}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => dispatch(UndoActionCreators.redo())}
        >
          <RedoIcon />
        </button>
      </Tooltip>
      <span style={divider} />
      <Tooltip label="Select (V)">
        <button
          style={btn(tool === 'select', false)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={choose('select')}
        >
          <SelectIcon />
        </button>
      </Tooltip>
      <Tooltip label="Pan (H, hold Space)">
        <button
          style={btn(tool === 'pan', false)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={choose('pan')}
        >
          <PanIcon />
        </button>
      </Tooltip>
      <span style={divider} />
      <Tooltip label="Keyboard shortcuts (?)">
        <button
          style={btn(false, false)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setHelpOpen(true)}
        >
          <HelpIcon />
        </button>
      </Tooltip>
      <EmbedActionMenu />
      <EmbedShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
