import {Graph} from "../model/Graph";

const createNode = (state = new Graph(), action) => {
  switch (action.type) {
    case 'CREATE_NODE':
      return state.createNode();

    default:
      return state
  }
}

export default createNode