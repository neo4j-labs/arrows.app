export default function dragging(
  state = {
    sourceNodeId: null,
    secondarySourceNodeIds: [],
    targetNodeIds: [],
    newNodePosition: null,
  },
  action
) {
  switch (action.type) {
    case 'ACTIVATE_RING':
      return {
        sourceNodeId: action.sourceNodeId,
        secondarySourceNodeIds: [],
        nodeType: action.nodeType,
        targetNodeIds: [],
        newNodePosition: null,
      };
    case 'RING_DRAGGED':
      return {
        sourceNodeId: action.sourceNodeId,
        secondarySourceNodeIds: action.secondarySourceNodeIds,
        targetNodeIds: action.targetNodeIds,
        newNodePosition: action.position,
      };
    case 'DEACTIVATE_RING':
    case 'END_DRAG':
      return {
        sourceNodeId: null,
        secondarySourceNodeIds: [],
        targetNodeIds: [],
        newNodePosition: null,
      };
    default:
      return state;
  }
}
