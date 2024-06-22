import React from 'react';
import thunkMiddleware from 'redux-thunk';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import './index.css';
import reducer from './reducers';
import App from './App';
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

const middleware = [
  thunkMiddleware,
  recentStorageMiddleware,
  storageMiddleware,
  windowLocationHashMiddleware,
  viewportMiddleware,
  imageCacheMiddleware,
];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
let store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(...middleware))
);
initGoogleDriveApi(store);
store.dispatch(windowResized(window.innerWidth, window.innerHeight));
store.dispatch(initRecentStorage(store.getState()));

const renderApp = () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  );
};

renderApp();

registerServiceWorker();
