export default function gestures(state = { activeRing: null, targetNodeId: null, newNodePosition: null }, action) {
  switch (action.type) {
    case 'ACTIVATE_RING':
      return { activeRing: action.sourceNodeId, targetNodeId: null, newNodePosition: null }

    case 'DEACTIVATE_RING':
      return { activeRing: null, targetNodeId: null, newNodePosition: null }

    case 'RING_DRAGGED':
      return { activeRing: action.sourceNodeId, targetNodeId: action.targetNodeId, newNodePosition: action.position }

    case 'END_DRAG':
      return { activeRing: null, targetNodeId: null, newNodePosition: null }

    default:
      return state
  }
}