export default function dragging(state = {
    sourceNodeId: null,
    targetNodeId: null,
    newNodePosition: null
}, action) {
  switch (action.type) {
    case 'ACTIVATE_RING':
      return {
        sourceNodeId: action.sourceNodeId, targetNodeId: null, newNodePosition: null
      }
    case 'DEACTIVATE_RING':
      return {
       sourceNodeId: null, targetNodeId: null, newNodePosition: null
      }
    case 'RING_DRAGGED':
      return {
          sourceNodeId: action.sourceNodeId,
          targetNodeId: action.targetNodeId,
          newNodePosition: action.position
      }
    case 'END_DRAG':
      return {
        sourceNodeId: null, targetNodeId: null, newNodePosition: null
      }
    default:
      return state
  }
}