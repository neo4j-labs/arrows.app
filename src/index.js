import React from 'react';
import thunkMiddleware from 'redux-thunk'
import {render} from 'react-dom';
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import './index.css'
import reducer from './reducers'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import 'semantic-ui-css/semantic.min.css'
import {viewportMiddleware} from "./middlewares/viewportMiddleware"
import {storageMiddleware} from "./middlewares/storageMiddleware";
import {initialiseStorageFromWindowLocationHash} from "./actions/storage";
import {windowLocationHashMiddleware} from "./middlewares/windowLocationHashMiddleware";
import {initGoogleDriveApi} from "./actions/googleDrive";

const middleware = [storageMiddleware, windowLocationHashMiddleware, viewportMiddleware]

let store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(thunkMiddleware, ...middleware)
)
initialiseStorageFromWindowLocationHash(store)
initGoogleDriveApi(store)

const renderApp = () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  )
}

renderApp()

registerServiceWorker()