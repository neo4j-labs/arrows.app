export default function gestures(state = { activeRing: null, newNodePosition: null }, action) {
  switch (action.type) {
    case 'ACTIVATE_RING':
      return { activeRing: action.sourceNodeId, newNodePosition: null }

    case 'DEACTIVATE_RING':
      return { activeRing: null, newNodePosition: null }

    case 'RING_DRAGGED':
      return { activeRing: action.sourceNodeId, newNodePosition: action.position }

    case 'END_DRAG':
      return { activeRing: null, newNodePosition: null }

    default:
      return state
  }
}