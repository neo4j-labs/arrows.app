import { EDIT_NODE, COLLAPSE_SIDEBAR, EDIT_RELATIONSHIP } from "../actions/sidebar";

const sidebar = (state = { state: 'collapsed' }, action) => {
  switch (action.type) {
    case EDIT_NODE:
      return {
        status: 'expanded',
        mode: 'edit-node',
        itemId: action.nodeId
      }
    case EDIT_RELATIONSHIP:
      return {
        status: 'expanded',
        mode: 'edit-relationship',
        itemId: action.relationshipId
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