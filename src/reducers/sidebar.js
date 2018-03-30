const sidebar = (state = { status: 'expanded' }, action) => {
  switch (action.type) {
    case 'TOGGLE_INSPECTOR':
      return {
        status: state.status === 'expanded' ? 'collapsed' : 'expanded',
      }
    default:
      return state
  }
}

export default sidebar