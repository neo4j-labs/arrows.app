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

  drawIfNeeded(info) {
    const { image, canvas, drawn, error } = info

    if (!drawn && image.complete && !error) {
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0, ImageSize, ImageSize)

      info.drawn = true
    }
  }

  getImageInfo(src) {
    const entry = this.getOrCreateEntry(src)
    const key = 'image'
    let info = entry[key]
    if (!info) {
      const onLoadCallback = () => { this.drawIfNeeded(info) }
      const onErrorCallback = () => { info.error = true }
      info = this.loadImage(src, onLoadCallback, onErrorCallback)
      entry[key] = info
    }
    this.drawIfNeeded(info)
    return info
  }

  getCanvas(src) {
    return this.getImageInfo(src).canvas
  }
}

const imageCache = new ImageCache()

export default imageCache
