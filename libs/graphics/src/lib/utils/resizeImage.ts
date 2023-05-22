
export const shrinkImageUrl = async (base64Data:string, targetBytes:number) => {
  if (base64Data.length < targetBytes) {
    return base64Data
  }

  const shrinkRatio = Math.sqrt(targetBytes / base64Data.length)
  const image = await loadAsImage(base64Data)
  return scaleImage(image, shrinkRatio)
}

const loadAsImage = (base64Data:string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = document.createElement('img')
    image.onload = () => {
      resolve(image)
    }
    image.onerror = () => {
      reject("Failed to load image")
    }
    image.src = base64Data
  })
}

const scaleImage = (image:HTMLImageElement, ratio:number) => {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, image.naturalWidth * ratio)
  canvas.height = Math.max(1, image.naturalHeight * ratio)

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL()
}