export default function selectionMarquee(state = null, action) {
  switch (action.type) {
    case 'SET_MARQUEE':
      return action.marquee
    case 'REMOVE_MARQUEE':
      return null
    default:
      return state
  }
}