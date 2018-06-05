export default function selectionMarquee(state = null, action) {
  switch (action.type) {
    case 'SET_MARQUEE':
      return action.marquee
    case 'END_DRAG':
      return null
    default:
      return state
  }
}