import { combineReducers } from 'redux'
import graph from "./graph";
import selection from "./selection";
import mouse from "./mouse";
import guides from "./guides";
import storageStatus from "./storageStatus";
import windowSize from "./windowSize";
import viewTransformation from "./viewTransformation";
import sidebar from "./sidebar"
import gestures from "./gestures";

const arrowsApp = combineReducers({
  graph,
  selection,
  mouse,
  gestures,
  guides,
  storageStatus,
  windowSize,
  viewTransformation,
  sidebar
})

export default arrowsApp
