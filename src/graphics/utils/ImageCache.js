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
    const cacheEntry = {
      canvas,
      image,
      drawn: false,
      error: false,
      width: image.naturalWidth,
      height: image.naturalHeight
    }

    fetch(src)
      .then(response => {
        cacheEntry.contentType = response.headers.get('Content-Type').split(';')[0]
        console.log(cacheEntry.contentType)
        return response.blob()
      })
      .then(blob => {
        if (cacheEntry.contentType === 'image/svg+xml') {
          blob.text().then(text => {
            cacheEntry.dataUrl = "data:image/svg+xml;utf8," + encodeURIComponent(text)
          })
        }
        image.src = URL.createObjectURL(blob)
      })

    return cacheEntry
  }

  drawIfNeeded(info) {
    const { image, canvas, drawn, error } = info

    if (!drawn && image.complete && !error) {
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0, ImageSize, ImageSize)

      info.drawn = true
      info.width = image.naturalWidth
      info.height = image.naturalHeight
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
}

const imageCache = new ImageCache()

export default imageCache
