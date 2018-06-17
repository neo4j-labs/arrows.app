import React from 'react';
import thunkMiddleware from 'redux-thunk'
import { render } from 'react-dom';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import './index.css'
import reducer from './reducers'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import {fetchGraphFromDatabase} from "./actions/neo4jStorage"
import 'semantic-ui-css/semantic.min.css'
import {storageMiddleware} from "./storage/neo4jStorage"
import { viewportMiddleware } from "./middlewares/viewportMiddleware"
import { initializeConnection } from "./actions/databaseConnection";

//noinspection JSUnresolvedVariable,JSUnresolvedFunction
let store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(thunkMiddleware, storageMiddleware, viewportMiddleware)
)

store.dispatch(initializeConnection())
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
store.dispatch(fetchGraphFromDatabase())
registerServiceWorker()
