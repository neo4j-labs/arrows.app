import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';

import reducer from './reducers';

import registerServiceWorker from './registerServiceWorker';
import 'semantic-ui-css/semantic.min.css';
import { viewportMiddleware } from './middlewares/viewportMiddleware';
import { storageMiddleware } from './middlewares/storageMiddleware';
import { windowLocationHashMiddleware } from './middlewares/windowLocationHashMiddleware';
import { initGoogleDriveApi } from './actions/googleDrive';
import { windowResized } from './actions/applicationLayout';
import {
  initRecentStorage,
  recentStorageMiddleware,
} from './middlewares/recentStorageMiddleware';
import { imageCacheMiddleware } from './middlewares/imageCacheMiddleware';

import './styles.css';

import App from './app/App';
import { fetchOntologies } from './actions/ontologies';

const middleware = [
  thunkMiddleware,
  recentStorageMiddleware,
  storageMiddleware,
  windowLocationHashMiddleware,
  viewportMiddleware,
  imageCacheMiddleware,
];

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(...middleware))
);
initGoogleDriveApi(store);
store.dispatch(windowResized(window.innerWidth, window.innerHeight));
store.dispatch(initRecentStorage(store.getState()));
store.dispatch(fetchOntologies());

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
    ,
  </StrictMode>
);

registerServiceWorker();
