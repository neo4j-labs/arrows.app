

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
  let dataUrl = undefined

  const image = document.createElement('img')
  image.setAttribute('crossorigin', 'anonymous')
  image.onload = () => {
    onLoad({
      status: 'LOADED',
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
      return response.blob()
    })
    .then(blob => {
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = function() {
        dataUrl = reader.result
        image.src = dataUrl
      }
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
