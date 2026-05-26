import { useSelector } from 'react-redux';
import InspectorChooser from '../containers/InspectorChooser';
import { inspectorWidth } from '@neo4j-arrows/model';

interface State {
  selection: { entities?: unknown[] };
}

const aside: React.CSSProperties = {
  width: inspectorWidth,
  overflowY: 'auto',
  borderLeft: '1px solid #D4D4D5',
  background: '#ffffff',
};

const placeholder: React.CSSProperties = {
  padding: '1rem',
  color: '#888',
  fontFamily: 'sans-serif',
  fontSize: 13,
};

export function EmbedInspectorPanel(): JSX.Element {
  const hasSelection = useSelector(
    (s: State) => (s.selection.entities?.length ?? 0) > 0,
  );
  return (
    <aside style={aside}>
      {hasSelection ? (
        <InspectorChooser />
      ) : (
        <div style={placeholder}>
          Select a node or relationship to edit its properties, labels, and style.
        </div>
      )}
    </aside>
  );
}
