export default function gestures(state = { activeRing: null }, action) {
  switch (action.type) {
    case 'ACTIVATE_RING':
      return { activeRing: action.nodeId }

    case 'DEACTIVATE_RING':
      return { activeRing: null }

    default:
      return state
  }
}