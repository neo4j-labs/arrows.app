import * as ReactDOM from 'react-dom/client';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reducer from '../reducers';
import GraphContainer from '../containers/GraphContainer';
import { viewportMiddleware } from '../middlewares/viewportMiddleware';
import { imageCacheMiddleware } from '../middlewares/imageCacheMiddleware';
import { windowResized } from '../actions/applicationLayout';
import { initBridge } from './bridge';
import { EmbedInspectorPanel } from './EmbedInspectorPanel';
import { EmbedErrorBoundary } from './EmbedErrorBoundary';
import { EmbedToolbar } from './EmbedToolbar';
import { EmbedCanvasContextMenu } from './EmbedCanvasContextMenu';
import { EmbedCanvasDoubleClick } from './EmbedCanvasDoubleClick';
import { EmbedKeybindings } from './EmbedKeybindings';
import { EmbedPanHandler } from './EmbedPanHandler';
import { EmbedDragContinuation } from './EmbedDragContinuation';
import { EmbedShiftMultiSelect } from './EmbedShiftMultiSelect';
import { EmbedToolShortcuts } from './EmbedToolShortcuts';
import { EmbedFooter } from './EmbedFooter';
import { ToolProvider } from './ToolContext';
import 'semantic-ui-css/semantic.min.css';
import '../styles.css';

const store = createStore(
  reducer,
  applyMiddleware(thunkMiddleware, viewportMiddleware, imageCacheMiddleware)
);

// Guard against silent breakage from web-app refactors. The embed assumes a
// specific store shape: a `graph` slice (with redux-undo's `present` field
// containing { nodes, relationships, style }) and a `viewTransformation` slice.
// If a future web-app change renames a slice or restructures the graph state,
// the canvas renders blank — fail loudly here instead.
const _bootState = store.getState() as Record<string, unknown>;
const _graph = _bootState['graph'] as { present?: { nodes?: unknown } } | undefined;
if (!_graph || !_graph.present || !Array.isArray(_graph.present.nodes)) {
  throw new Error(
    '[arrows-embed] Store shape mismatch: expected state.graph.present.nodes (array). ' +
      'Likely cause: arrows-ts reducer refactor without updating the embed. ' +
      'Check apps/arrows-ts/src/reducers/index.ts.'
  );
}
if (!_bootState['viewTransformation']) {
  throw new Error(
    '[arrows-embed] Store shape mismatch: expected state.viewTransformation slice. ' +
      'Check apps/arrows-ts/src/reducers/index.ts.'
  );
}

const CHROME_PADDING = 72;
const pushViewport = () => {
  store.dispatch(
    windowResized(window.innerWidth, window.innerHeight + CHROME_PADDING)
  );
};
pushViewport();
window.addEventListener('resize', pushViewport);

const bridge = initBridge(store);
// acquireVsCodeApi is one-shot — child components reach the host via this hook.
(
  window as unknown as { __arrowsHostPost: (m: unknown) => void }
).__arrowsHostPost = bridge.post;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <EmbedErrorBoundary fallbackLabel="Embed crashed">
    <Provider store={store}>
      <ToolProvider>
        <EmbedKeybindings />
        <EmbedToolShortcuts />
        <EmbedCanvasDoubleClick />
        <EmbedShiftMultiSelect />
        <EmbedPanHandler />
        <EmbedDragContinuation />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <EmbedErrorBoundary fallbackLabel="Canvas render error">
              <GraphContainer />
            </EmbedErrorBoundary>
            <EmbedErrorBoundary fallbackLabel="Toolbar error">
              <EmbedToolbar />
            </EmbedErrorBoundary>
            <EmbedErrorBoundary fallbackLabel="Context menu error">
              <EmbedCanvasContextMenu />
            </EmbedErrorBoundary>
            <EmbedFooter />
          </div>
          <EmbedErrorBoundary fallbackLabel="Inspector error">
            <EmbedInspectorPanel />
          </EmbedErrorBoundary>
        </div>
      </ToolProvider>
    </Provider>
  </EmbedErrorBoundary>
);
