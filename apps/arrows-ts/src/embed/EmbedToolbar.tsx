import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import { useTool, type Tool } from './ToolContext';
import { shortcut } from './platformKeys';
import { EmbedActionMenu } from './EmbedActionMenu';

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

  return (
    <div style={wrap}>
      {/* preventDefault on mousedown stops the browser from focusing the button on click —
          we use the blue background as the active indicator and don't want a stale focus ring. */}
      <button
        style={btn(false, !canUndo)}
        disabled={!canUndo}
        title={`Undo (${shortcut({ mod: 'cmd', key: 'Z' })})`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => dispatch(UndoActionCreators.undo())}
      >
        <UndoIcon />
      </button>
      <button
        style={btn(false, !canRedo)}
        disabled={!canRedo}
        title={`Redo (${shortcut({ mod: 'cmd+shift', key: 'Z' })})`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => dispatch(UndoActionCreators.redo())}
      >
        <RedoIcon />
      </button>
      <span style={divider} />
      <button
        style={btn(tool === 'select', false)}
        title="Select (V)"
        onMouseDown={(e) => e.preventDefault()}
        onClick={choose('select')}
      >
        <SelectIcon />
      </button>
      <button
        style={btn(tool === 'pan', false)}
        title="Pan (H, hold Space)"
        onMouseDown={(e) => e.preventDefault()}
        onClick={choose('pan')}
      >
        <PanIcon />
      </button>
      <span style={divider} />
      <EmbedActionMenu />
    </div>
  );
}
