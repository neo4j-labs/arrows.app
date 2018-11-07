import { combineReducers } from 'redux'
import databaseConnection from "./databaseConnection";
import diagramName from "./diagramName";
import graph from "./graph";
import selection from "./selection";
import mouse from "./mouse";
import guides from "./guides";
import storage from "./storage";
import applicationLayout from "./applicationLayout";
import viewTransformation from "./viewTransformation";
import gestures from "./gestures";
import actionMemos from "./actionMemos";
import exporting from "./exporting";

const arrowsApp = combineReducers({
  databaseConnection,
  diagramName,
  graph,
  selection,
  mouse,
  gestures,
  guides,
  storage: storage,
  applicationLayout,
  viewTransformation,
  actionMemos,
  exporting
})

export default arrowsApp
