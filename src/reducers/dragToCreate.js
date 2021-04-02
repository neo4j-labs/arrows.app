export default function dragging(state = {
  sourceNodeId: null,
  secondarySourceNodeIds: [],
  targetNodeId: null,
  newNodePosition: null
}, action) {
  switch (action.type) {
    case 'ACTIVATE_RING':
      return {
        sourceNodeId: action.sourceNodeId,
        secondarySourceNodeIds: [],
        nodeType: action.nodeType,
        targetNodeId: null,
        newNodePosition: null
      }
    case 'RING_DRAGGED':
      return {
        sourceNodeId: action.sourceNodeId,
        secondarySourceNodeIds: action.secondarySourceNodeIds,
        targetNodeId: action.targetNodeId,
        newNodePosition: action.position
      }
    case 'DEACTIVATE_RING':
    case 'END_DRAG':
      return {
        sourceNodeId: null,
        secondarySourceNodeIds: [],
        targetNodeId: null,
        newNodePosition: null
      }
    default:
      return state
  }
}