import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import { Button, Icon } from 'semantic-ui-react';
import { useTool, type Tool } from '../store/ToolContext';
import { shortcut } from '../interactions/platformKeys';
import { EmbedActionMenu } from './EmbedActionMenu';
import { Tooltip } from './Tooltip';
import { EmbedShortcutsHelp, HELP_TOGGLE_KEY, isHelpToggle } from './EmbedShortcutsHelp';
import { ignoreTarget } from '../../interactions/Keybindings';

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
  alignItems: 'center',
  background: 'rgba(255,255,255,0.92)',
  padding: 4,
  borderRadius: 4,
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
};

const verticalDivider: React.CSSProperties = {
  width: 1,
  height: 20,
  background: '#e0e0e0',
  margin: '0 4px',
};

export function EmbedToolbar(): JSX.Element {
  const dispatch = useDispatch();
  const { tool, setTool } = useTool();
  const canUndo = useSelector((s: { graph: GraphSlice }) => (s.graph.past?.length ?? 0) > 0);
  const canRedo = useSelector((s: { graph: GraphSlice }) => (s.graph.future?.length ?? 0) > 0);

  const choose = (t: Tool) => (): void => setTool(t);

  const [helpOpen, setHelpOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (ignoreTarget(e)) return;
      if (isHelpToggle(e)) {
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
        <Button
          icon
          basic
          disabled={!canUndo}
          onClick={() => dispatch(UndoActionCreators.undo())}
        >
          <Icon name="undo" />
        </Button>
      </Tooltip>
      <Tooltip label={`Redo (${shortcut({ mod: 'cmd+shift', key: 'Z' })})`}>
        <Button
          icon
          basic
          disabled={!canRedo}
          onClick={() => dispatch(UndoActionCreators.redo())}
        >
          <Icon name="redo" />
        </Button>
      </Tooltip>
      <span style={verticalDivider} />
      <Tooltip label="Select (V)">
        <Button icon basic active={tool === 'select'} onClick={choose('select')}>
          <Icon name="mouse pointer" />
        </Button>
      </Tooltip>
      <Tooltip label="Pan (H, hold Space)">
        <Button icon basic active={tool === 'pan'} onClick={choose('pan')}>
          <Icon name="hand paper" />
        </Button>
      </Tooltip>
      <span style={verticalDivider} />
      <Tooltip label={`Keyboard shortcuts (${HELP_TOGGLE_KEY})`}>
        <Button icon basic onClick={() => setHelpOpen(true)}>
          <Icon name="question circle outline" />
        </Button>
      </Tooltip>
      <EmbedActionMenu />
      <EmbedShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
