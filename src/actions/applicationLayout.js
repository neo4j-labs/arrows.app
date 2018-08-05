export const windowResized = (width, height) => {
  return {
    type: 'WINDOW_RESIZED',
    width,
    height
  }
}

export const showInspector = () => {
  return {
    type: 'SHOW_INSPECTOR'
  }
}

export const hideInspector = () => {
  return {
    type: 'HIDE_INSPECTOR'
  }
}