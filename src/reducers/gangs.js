import { moveTo } from "../model/Node";

const initialState = []

export default (state = initialState, action) => {
  switch (action.type) {
    case 'CREATE_CLUSTER':
      return state.concat([{
        id: action.nodeId,
        position: action.position,
        caption: action.caption,
        style: action.style,
        properties: {},
        type: action.nodeType,
        members: action.members,
        initialPosition: action.initialPosition
      }])
    case 'REMOVE_CLUSTER':
      return state.filter(gang => gang.id !== action.nodeId)

    case 'MOVE_NODES':
      const nodeIdToNode = {}
      state.forEach((node) => {
        nodeIdToNode[node.id] = node
      })

      action.nodePositions.forEach((nodePosition) => {
        if(nodeIdToNode[nodePosition.nodeId]) {
          nodeIdToNode[nodePosition.nodeId] = moveTo(nodeIdToNode[nodePosition.nodeId], nodePosition.position)
        }
      })

      return [...Object.values(nodeIdToNode)]
    default:
      return state
  }
}