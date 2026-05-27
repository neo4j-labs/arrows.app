import InspectorChooser from '../containers/InspectorChooser';
import { inspectorWidth } from '@neo4j-arrows/model';

// InspectorChooser already handles both states: it routes to
// InspectorContainer when a node/rel is selected, and to GeneralInspectorContainer
// otherwise — which renders the node/rel counters, Add Node, and Theme cards
// the web app shows. Mount it unconditionally and let it pick.

const aside: React.CSSProperties = {
  width: inspectorWidth,
  overflowY: 'auto',
  borderLeft: '1px solid #D4D4D5',
  background: '#ffffff',
};

export function EmbedInspectorPanel(): JSX.Element {
  return (
    <aside style={aside}>
      <InspectorChooser />
    </aside>
  );
}
