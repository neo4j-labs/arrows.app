export const containsCachedImage = (cachedImages, imageUrl) => {
  return cachedImages.hasOwnProperty(imageUrl)
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
  image.onerror = (event) => {
    onError(event)
  }

  fetch(imageUrl)
    .then(response => {
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

  return {
    status: 'LOADING',
    image
  }
}
