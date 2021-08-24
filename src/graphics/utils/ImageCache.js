const ImageSize = 64

class ImageCache {
  constructor () {
    this.cache = {}
    this.imageLoadedListeners = []
  }

  addImageLoadedListener (callback) {
    this.imageLoadedListeners.push(callback)
  }

  removeImageLoadedListener (callback) {
    const callbackIndex = this.imageLoadedListeners.findIndex(aCallback => aCallback === callback)
    if (callbackIndex >= 0) {
      this.imageLoadedListeners.splice(callbackIndex, 1)
    }
  }

  getOrCreateEntry (src) {
    let entry = this.cache[src]
    if (!entry) {
      entry = {
        image: null,
        inverted: null
      }
      this.cache[src] = entry
    }
    return entry
  }

  invertCanvas (ctx) {
    const imgData = ctx.getImageData(0, 0, ImageSize, ImageSize)
    const data = imgData.data

    for (let i = 0; i < ImageSize * ImageSize; i++) {
      data[i * 4 + 0] = 255 - data[i * 4 + 0]
      data[i * 4 + 1] = 255 - data[i * 4 + 1]
      data[i * 4 + 2] = 255 - data[i * 4 + 2]
      data[i * 4 + 3] = data[i * 4 + 3]
    }

    ctx.putImageData(imgData, 0, 0)
  }

  loadImage (src, onLoad, onError) {
    const canvas = document.createElement('canvas')
    canvas.width = ImageSize
    canvas.height = ImageSize

    const image = document.createElement('img')
    image.setAttribute('crossorigin', 'anonymous')
    const listeners = this.imageLoadedListeners
    image.onload = function () {
      onLoad()
      listeners.forEach(callback => callback(src))
    }
    image.onerror = function () {
      onError()
    }
    image.src = src

    return {
      canvas,
      image,
      drawn: false,
      error: false
    }
  }

  drawIfNeeded (info, inverted) {
    const { image, canvas, drawn, error } = info

    if (!drawn && image.complete && !error) {
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0, ImageSize, ImageSize)

      if (inverted) {
        this.invertCanvas(ctx)
      }

      info.drawn = true
    }
  }

  getImageInfo (src, inverted) {
    const entry = this.getOrCreateEntry(src)
    const key = inverted ? 'inverted' : 'image'
    let info = entry[key]
    if (!info) {
      const onLoadCallback = () => { this.drawIfNeeded(info, inverted) }
      const onErrorCallback = () => { info.error = true }
      info = this.loadImage(src, onLoadCallback, onErrorCallback)
      entry[key] = info
    }
    this.drawIfNeeded(info, inverted)
    return info
  }

  getImage (src, inverted) {
    return this.getImageInfo(src, inverted).image
  }

  getCanvas (src, inverted) {
    return this.getImageInfo(src, inverted).canvas
  }
}

const imageCache = new ImageCache()

export default imageCache
