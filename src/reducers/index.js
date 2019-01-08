import { combineReducers } from 'redux'
import storage from "./storage";
import storageStatus from "./storageStatus";
import diagramName from "./diagramName";
import graph from "./graph";
import selection from "./selection";
import mouse from "./mouse";
import guides from "./guides";
import applicationLayout from "./applicationLayout";
import viewTransformation from "./viewTransformation";
import gestures from "./gestures";
import actionMemos from "./actionMemos";
import applicationDialogs from "./applicationDialogs";

const arrowsApp = combineReducers({
  storage,
  storageStatus,
  diagramName,
  graph,
  selection,
  mouse,
  gestures,
  guides,
  applicationLayout,
  viewTransformation,
  actionMemos,
  applicationDialogs
})

export default arrowsApp
