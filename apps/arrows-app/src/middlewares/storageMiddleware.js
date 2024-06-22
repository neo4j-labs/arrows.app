import { updateStore as updateNeoStore } from '../storage/neo4jStorage';
import { renameGoogleDriveStore, saveFile } from '../actions/googleDrive';
import { getPresentGraph } from '../selectors';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import {
  loadGraphFromLocalStorage,
  saveGraphToLocalStorage,
} from '../actions/localStorage';
import {
  postedFileOnGoogleDrive,
  postedFileToLocalStorage,
  postingGraph,
  putGraph,
  puttingGraph,
  puttingGraphSucceeded,
} from '../actions/storage';
import { fetchGraphFromDrive } from '../storage/googleDriveStorage';

const updateQueue = [];

const driveUpdateInterval = 1000; // ms
const localUpdateInterval = 500; // ms
let waiting;

const deBounce = (func, delay) => {
  clearTimeout(waiting);
  waiting = setTimeout(func, delay);
};

const historyActions = [
  UndoActionCreators.undo().type,
  UndoActionCreators.redo().type,
];

export const storageMiddleware = (store) => (next) => (action) => {
  const hideGraphHistory = (state) => ({
    ...state,
    graph: getPresentGraph(state),
  });

  const oldState = hideGraphHistory(store.getState());
  const result = next(action);
  const newState = hideGraphHistory(store.getState());
  const storage = newState.storage;
  const graph = newState.graph;
  const cachedImages = newState.cachedImages;
  const diagramName = newState.diagramName;

  if (action.type === 'RENAME_DIAGRAM') {
    switch (storage.mode) {
      case 'GOOGLE_DRIVE':
        renameGoogleDriveStore(storage.fileId, action.diagramName);
        break;

      case 'LOCAL_STORAGE':
        saveGraphToLocalStorage(storage.fileId, { graph, diagramName });
        break;
    }
  }

  if (storage.mode === 'GOOGLE_DRIVE' && newState.googleDrive.signedIn) {
    switch (storage.status) {
      case 'GET': {
        const fileId = storage.fileId;
        store.dispatch(fetchGraphFromDrive(fileId));
        break;
      }

      case 'POST': {
        store.dispatch(postingGraph());
        const onFileSaved = (fileId) => {
          store.dispatch(postedFileOnGoogleDrive(fileId));
        };

        saveFile(graph, cachedImages, null, newState.diagramName, onFileSaved);
        break;
      }
    }
  }

  if (storage.mode === 'LOCAL_STORAGE') {
    switch (storage.status) {
      case 'GET': {
        const fileId = storage.fileId;
        store.dispatch(loadGraphFromLocalStorage(fileId));
        break;
      }

      case 'POST': {
        const fileId = storage.fileId;
        saveGraphToLocalStorage(fileId, { graph, diagramName });
        store.dispatch(postedFileToLocalStorage());
        break;
      }
    }
  }

  if (action.category === 'GRAPH' || historyActions.includes(action.type)) {
    switch (storage.mode) {
      case 'LOCAL_STORAGE':
        if (
          oldState.graph !== newState.graph ||
          oldState.gangs !== newState.gangs
        ) {
          if (oldState.storage.status !== 'PUTTING') {
            store.dispatch(puttingGraph());
          }
          deBounce(() => {
            saveGraphToLocalStorage(storage.fileId, { graph, diagramName });
            store.dispatch(puttingGraphSucceeded());
          }, localUpdateInterval);
        }
        break;

      case 'GOOGLE_DRIVE':
        if (
          oldState.graph !== newState.graph ||
          oldState.gangs !== newState.gangs
        ) {
          if (oldState.storage.status !== 'PUT') {
            store.dispatch(putGraph());
          }

          deBounce(() => {
            store.dispatch(puttingGraph());

            saveFile(
              graph,
              cachedImages,
              storage.fileId,
              newState.diagramName,
              (fileId) => {
                if (fileId !== storage.fileId) {
                  console.warn(
                    'Unexpected change of fileId from %o to %o',
                    storage.fileId,
                    fileId
                  );
                }
                store.dispatch(puttingGraphSucceeded());
              }
            );
          }, driveUpdateInterval);
        }
        break;

      case 'DATABASE':
        if (action.category === 'GRAPH') {
          updateQueue.push(action);
          drainUpdateQueue(newState);
        }
        break;
    }
  }
  return result;
};

const drainUpdateQueue = (state) => {
  const applyHead = () => {
    if (updateQueue.length > 0) {
      const action = updateQueue.shift();

      updateNeoStore(action, state)
        .then(() => {
          applyHead();
        })
        .catch((error) => console.log(error));
    }
  };

  applyHead();
};
