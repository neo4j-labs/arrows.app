import * as ReactDOM from 'react-dom/client';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reducer from '../reducers';
import GraphContainer from '../containers/GraphContainer';
import { imageCacheMiddleware } from '../middlewares/imageCacheMiddleware';
import { windowResized } from '../actions/applicationLayout';
import { headerHeight, footerHeight } from '../model/applicationLayout';
import { initBridge } from './bridge/bridge';
import { embedWindow } from './bridge/hostPost';
import { embedViewportMiddleware } from './store/embedViewportMiddleware';
import { ToolProvider } from './store/ToolContext';
import { EmbedKeybindings } from './interactions/EmbedKeybindings';
import { EmbedToolShortcuts } from './interactions/EmbedToolShortcuts';
import { EmbedCanvasDoubleClick } from './interactions/EmbedCanvasDoubleClick';
import { EmbedShiftMultiSelect } from './interactions/EmbedShiftMultiSelect';
import { EmbedPanHandler } from './interactions/EmbedPanHandler';
import { EmbedDragContinuation } from './interactions/EmbedDragContinuation';
import { EmbedErrorBoundary } from './ui/EmbedErrorBoundary';
import { EmbedToolbar } from './ui/EmbedToolbar';
import { EmbedCanvasContextMenu } from './ui/EmbedCanvasContextMenu';
import { EmbedInspectorPanel } from './ui/EmbedInspectorPanel';
import { EmbedFooter } from './ui/EmbedFooter';
import 'semantic-ui-css/semantic.min.css';
import '../styles.css';

const store = createStore(
  reducer,
  applyMiddleware(thunkMiddleware, embedViewportMiddleware, imageCacheMiddleware)
);

const CHROME_PADDING = headerHeight + footerHeight + 2;
const pushViewport = () => {
  store.dispatch(
    windowResized(window.innerWidth, window.innerHeight + CHROME_PADDING)
  );
};
pushViewport();
window.addEventListener('resize', pushViewport);

const bridge = initBridge(store);
// acquireVsCodeApi is one-shot per webview; expose a posting hook for children.
embedWindow().__arrowsHostPost = bridge.post;

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
            <EmbedErrorBoundary fallbackLabel="Footer error">
              <EmbedFooter />
            </EmbedErrorBoundary>
          </div>
          <EmbedErrorBoundary fallbackLabel="Inspector error">
            <EmbedInspectorPanel />
          </EmbedErrorBoundary>
        </div>
      </ToolProvider>
    </Provider>
  </EmbedErrorBoundary>
);
