import {Guides} from "../model-old/guides/guides";

export default function guides(state = new Guides(), action) {
  switch (action.type) {
    case 'MOVE_NODES':
    case 'RING_DRAGGED':
      return action.guides

    case 'END_DRAG':
      return new Guides()

    default:
      return state
  }
}