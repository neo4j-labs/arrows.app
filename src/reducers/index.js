import { combineReducers } from 'redux'
import graph from "./graph";
import storageStatus from "./storageStatus";
import windowSize from "./windowSize";
import viewTransformation from "./viewTransformation";

const arrowsApp = combineReducers({
  graph,
  storageStatus,
  windowSize,
  viewTransformation
})

export default arrowsApp
