import { combineReducers } from 'redux'
import dragging from "./dragging";
import selection from "./selection";

const gestures = combineReducers({
  dragging,
  selection
})

export default gestures
