import { combineReducers } from 'redux'
import databaseConnection from "./databaseConnection";
import graph from "./graph";
import selection from "./selection";
import mouse from "./mouse";
import guides from "./guides";
import storage from "./storage";
import applicationLayout from "./applicationLayout";
import viewTransformation from "./viewTransformation";
import gestures from "./gestures";
import actionMemos from "./actionMemos";

const arrowsApp = combineReducers({
  databaseConnection,
  graph,
  selection,
  mouse,
  gestures,
  guides,
  storage: storage,
  applicationLayout,
  viewTransformation,
  actionMemos
})

export default arrowsApp
