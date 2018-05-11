import { combineReducers } from 'redux'
import dragToCreate from "./dragToCreate";
import selectionPath from "./selectionPath";
import selectionMarquee from "./selectionMarquee";

const gestures = combineReducers({
  dragToCreate,
  selectionPath,
  selectionMarquee
})

export default gestures
