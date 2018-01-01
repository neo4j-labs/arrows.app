import { combineReducers } from 'redux'
import graph from "./graph";
import storageStatus from "./storageStatus";
import windowSize from "./windowSize";

const arrowsApp = combineReducers({
  graph,
  storageStatus,
  windowSize
})

export default arrowsApp
