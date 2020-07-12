export const headerHeight = 60
export const inspectorWidth = 425

export const computeCanvasSize = (applicationLayout) => {
  const { windowSize, inspectorVisible } = applicationLayout
  return {
    width: windowSize.width - (inspectorVisible ? inspectorWidth : 0),
    height: windowSize.height - headerHeight - 2
  }
}