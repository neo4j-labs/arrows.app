import { combineReducers } from 'redux'
import graph from "./graph";
import windowSize from "./windowSize";

const arrowsApp = combineReducers({
  graph,
  windowSize
})

export default arrowsApp
