
export const headerHeight = 40
export const footerHeight = 30
export const inspectorWidth = 425
export const canvasPadding = 50

export interface ApplicationLayout {
  windowSize: {width:number, height:number}
  inspectorVisible: boolean
  layers: any[]
}

export const computeCanvasSize = (applicationLayout:ApplicationLayout) => {
  const { windowSize, inspectorVisible } = applicationLayout
  return {
    width: windowSize.width - (inspectorVisible ? inspectorWidth : 0),
    height: windowSize.height - headerHeight - footerHeight - 2
  }
}

export interface CanvasSize {
  width: number
  height: number
}

export const subtractPadding = (canvasSize:CanvasSize) => {
  return {
    width: canvasSize.width - canvasPadding * 2,
    height: canvasSize.height - canvasPadding * 2
  }
}