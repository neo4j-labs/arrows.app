import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import InspectorChooser from '../containers/InspectorChooser';
import { inspectorWidth } from '@neo4j-arrows/model';
// @ts-expect-error JS module without .d.ts.
import { toggleInspector } from '../actions/applicationLayout';

const wrapBase: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'stretch',
  transition: 'margin-right 200ms ease',
};
const wrapShown: React.CSSProperties = { ...wrapBase, marginRight: 0 };
const wrapHidden: React.CSSProperties = { ...wrapBase, marginRight: -inspectorWidth };
const iconStyle: React.CSSProperties = { margin: 0 };

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
  const label = visible ? 'Hide inspector' : 'Show inspector';
  return (
    <div style={visible ? wrapShown : wrapHidden}>
      <div
        role="button"
        title={label}
        aria-label={label}
        style={handle}
        onClick={() => dispatch(toggleInspector())}
      >
        <Icon name={visible ? 'angle right' : 'angle left'} style={iconStyle} />
      </div>
      <aside style={aside}>
        <InspectorChooser />
      </aside>
    </div>
  );
}
