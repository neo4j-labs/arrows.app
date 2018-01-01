import {Graph} from "../model/Graph";

const graph = (state = new Graph(), action) => {
  switch (action.type) {
    case 'CREATE_NODE':
      return state.createNode();

    default:
      return state
  }
}

export default graph