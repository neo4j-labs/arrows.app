import {Guides} from "../model/Guides"

export default function guides(state = new Guides(), action) {
  switch (action.type) {
    case 'PLACE_GUIDES':
      return new Guides(action.guidelines, action.naturalPosition)

    case 'END_DRAG':
      return new Guides()

    default:
      return state
  }
}