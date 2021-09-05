export const containsCachedImage = (cachedImages, imageUrl) => {
  return cachedImages.hasOwnProperty(imageUrl)
}

export const isImageInfoLoaded = (imageInfo) => {
  return imageInfo && imageInfo.status === 'LOADED'
}

export const getCachedImage = (cachedImages, imageUrl) => {
  return cachedImages[imageUrl] || {
    status: 'UNKNOWN',
    errorMessage: 'Image not cached',
    image: document.createElement('img'),
    width: 0,
    height: 0
  }
}

export const loadImage = (imageUrl, onLoad, onError) => {
  let contentType = undefined
  let dataUrl = undefined

  const image = document.createElement('img')
  image.setAttribute('crossorigin', 'anonymous')
  image.onload = () => {
    onLoad({
      status: 'LOADED',
      contentType,
      image,
      dataUrl,
      width: image.naturalWidth,
      height: image.naturalHeight
    })
  }
  image.onerror = () => {
    onError({
      status: 'ERROR',
      errorMessage: 'Image failed to load',
      image: document.createElement('img'),
      width: 0,
      height: 0
    })
  }

  fetch(imageUrl)
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      contentType = response.headers.get('Content-Type').split(';')[0]
      return response.blob()
    })
    .then(blob => {
      if (contentType === 'image/svg+xml') {
        blob.text().then(text => {
          dataUrl = "data:image/svg+xml;utf8," + encodeURIComponent(text)
        })
      }
      image.src = URL.createObjectURL(blob)
    })
    .catch(reason => {
      onError({
        status: 'ERROR',
        errorMessage: reason,
        image: image,
        width: 0,
        height: 0
      })
    })

  return {
    status: 'LOADING',
    image,
    width: 0,
    height: 0
  }
}
