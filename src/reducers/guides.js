import {Guides} from "../graphics/Guides"

export default function guides(state = new Guides(), action) {
  switch (action.type) {
    case 'PLACE_GUIDES':
      return new Guides(action.guidelines, action.naturalPosition)

    case 'CLEAR_GUIDES':
      return new Guides()

    case 'END_DRAG':
      return new Guides()

    default:
      return state
  }
}