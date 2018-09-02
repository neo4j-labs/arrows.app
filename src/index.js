import React from 'react';
import thunkMiddleware from 'redux-thunk'
import { render } from 'react-dom';
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import './index.css'
import reducer from './reducers'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import {fetchGraphFromDatabase} from "./storage/neo4jStorage"
import 'semantic-ui-css/semantic.min.css'
import {storageMiddleware} from "./storage/neo4jStorage"
import { viewportMiddleware } from "./middlewares/viewportMiddleware"
import { initializeConnection } from "./actions/databaseConnection";
import { googleDriveUrlRegex } from "./actions/googleDrive";
import { fetchGraphFromDrive } from "./storage/googleDriveStorage";

const checkInitialFile = () => {
  const urlDriveParts = googleDriveUrlRegex.exec(window.location.hash)
  if (urlDriveParts && urlDriveParts.length > 1) {
    const initialFiles = urlDriveParts[1].split(',')
    if (initialFiles.length > 0) {
      return initialFiles[0]
    }
  }
}

const initialFileId = checkInitialFile()
const middlewares = [viewportMiddleware]
if (!initialFileId) {
  middlewares.unshift(storageMiddleware)
}

let store = createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(thunkMiddleware, ...middlewares)
)

const renderApp = () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  )
}

if (initialFileId) {
  renderApp()
  window.addEventListener("load", () => {
    store.dispatch(fetchGraphFromDrive(initialFileId))
  })
} else {
  store.dispatch(initializeConnection())
  renderApp(store)
  store.dispatch(fetchGraphFromDatabase())
}

registerServiceWorker()