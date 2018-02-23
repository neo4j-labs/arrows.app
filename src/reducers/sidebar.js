import { EDIT_NODE, COLLAPSE_SIDEBAR } from "../actions/sidebar";

const sidebar = (state = { state: 'collapsed' }, action) => {
  switch (action.type) {
    case EDIT_NODE:
      return {
        status: 'expanded',
        mode: 'edit-node',
        item: action.node
      }
    case COLLAPSE_SIDEBAR:
      return {
        status: 'collapsed'
      }
    default:
      return state
  }
}

export default sidebar