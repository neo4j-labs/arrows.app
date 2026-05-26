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
import { EmbedToolShortcuts } from './EmbedToolShortcuts';
import { ToolProvider } from './ToolContext';
import 'semantic-ui-css/semantic.min.css';
import '../styles.css';

const store = createStore(
  reducer,
  applyMiddleware(thunkMiddleware, viewportMiddleware, imageCacheMiddleware),
);

const CHROME_PADDING = 72;
const pushViewport = () => {
  store.dispatch(windowResized(window.innerWidth, window.innerHeight + CHROME_PADDING));
};
pushViewport();
window.addEventListener('resize', pushViewport);

const bridge = initBridge(store);
// acquireVsCodeApi is one-shot — child components reach the host via this hook.
(window as unknown as { __arrowsHostPost: (m: unknown) => void }).__arrowsHostPost = bridge.post;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <Provider store={store}>
    <ToolProvider>
      <EmbedKeybindings />
      <EmbedToolShortcuts />
      <EmbedCanvasDoubleClick />
      <EmbedPanHandler />
      <EmbedDragContinuation />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <EmbedErrorBoundary fallbackLabel="Canvas render error">
            <GraphContainer />
          </EmbedErrorBoundary>
          <EmbedToolbar />
          <EmbedCanvasContextMenu />
        </div>
        <EmbedErrorBoundary fallbackLabel="Inspector error">
          <EmbedInspectorPanel />
        </EmbedErrorBoundary>
      </div>
    </ToolProvider>
  </Provider>,
);
