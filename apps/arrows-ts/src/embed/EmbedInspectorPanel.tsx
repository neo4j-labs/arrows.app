import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import InspectorChooser from '../containers/InspectorChooser';
import { inspectorWidth } from '@neo4j-arrows/model';
// @ts-expect-error JS module without .d.ts.
import { toggleInspector } from '../actions/applicationLayout';

const wrap: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'stretch',
  transition: 'margin-right 200ms ease',
};

const aside: React.CSSProperties = {
  width: inspectorWidth,
  overflowY: 'auto',
  borderLeft: '1px solid #D4D4D5',
  background: '#ffffff',
};

const handle: React.CSSProperties = {
  position: 'absolute',
  left: -22,
  top: 12,
  width: 22,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.92)',
  border: '1px solid #D4D4D5',
  borderRight: 'none',
  borderRadius: '4px 0 0 4px',
  cursor: 'pointer',
  zIndex: 5,
  boxShadow: '-1px 1px 3px rgba(0,0,0,0.08)',
  color: '#555',
};

export function EmbedInspectorPanel(): JSX.Element {
  const dispatch = useDispatch();
  const visible = useSelector(
    (s: { applicationLayout: { inspectorVisible: boolean } }) =>
      s.applicationLayout.inspectorVisible
  );
  return (
    <div style={{ ...wrap, marginRight: visible ? 0 : -inspectorWidth }}>
      <div
        role="button"
        title={visible ? 'Hide inspector' : 'Show inspector'}
        aria-label={visible ? 'Hide inspector' : 'Show inspector'}
        style={handle}
        onClick={() => dispatch(toggleInspector())}
      >
        <Icon name={visible ? 'angle right' : 'angle left'} style={{ margin: 0 }} />
      </div>
      <aside style={aside}>
        <InspectorChooser />
      </aside>
    </div>
  );
}
