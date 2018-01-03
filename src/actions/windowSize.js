export const windowResized = (width, height) => {
  return {
    type: 'WINDOW_RESIZED',
    width,
    height
  }
}