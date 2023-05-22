import { combineReducers } from 'redux'
import dragToCreate from "./dragToCreate";
import selectionMarquee from "./selectionMarquee";

const gestures = combineReducers({
  dragToCreate,
  selectionMarquee
})

export default gestures
