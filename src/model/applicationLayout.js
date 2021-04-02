export const headerHeight = 40
export const footerHeight = 30
export const inspectorWidth = 425
export const canvasPadding = 50

export const computeCanvasSize = (applicationLayout) => {
  const { windowSize, inspectorVisible } = applicationLayout
  return {
    width: windowSize.width - (inspectorVisible ? inspectorWidth : 0),
    height: windowSize.height - headerHeight - footerHeight - 2
  }
}

export const subtractPadding = (canvasSize) => {
  return {
    width: canvasSize.width - canvasPadding * 2,
    height: canvasSize.height - canvasPadding * 2
  }
}