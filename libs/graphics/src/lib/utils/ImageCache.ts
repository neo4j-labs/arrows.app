export type DataURL = string | ArrayBuffer | null;

export interface ImageInfo {
  status: 'UNKNOWN' | 'LOADED' | 'ERROR' | 'LOADING';
  errorMessage?: string;
  image: HTMLImageElement;
  dataUrl?: DataURL;
  width: number;
  height: number;
}

export const dataUrlToString = (d: DataURL | undefined) =>
  d === undefined || d === null
    ? `Missing DataURL`
    : typeof d === 'string'
    ? d
    : new TextDecoder('utf-8').decode(d); // ABK: a bit of a hack

export const containsCachedImage = (
  cachedImages: Record<string, ImageInfo>,
  imageUrl: string
): boolean => {
  return Object.hasOwn(cachedImages, imageUrl);
};

export const isImageInfoLoaded = (imageInfo: ImageInfo) => {
  return imageInfo && imageInfo.status === 'LOADED';
};

export const getCachedImage = (
  cachedImages: Record<string, ImageInfo>,
  imageUrl: string
): ImageInfo => {
  return (
    cachedImages[imageUrl] || {
      status: 'UNKNOWN',
      errorMessage: 'Image not cached',
      image: document.createElement('img'),
      width: 0,
      height: 0,
    }
  );
};

export const loadImage = (
  imageUrl: string,
  onLoad: (image: ImageInfo) => unknown,
  onError: (image: ImageInfo) => unknown
): ImageInfo => {
  let dataUrl: DataURL | undefined = undefined;

  const image = document.createElement('img');
  image.setAttribute('crossorigin', 'anonymous');
  image.onload = () => {
    onLoad({
      status: 'LOADED',
      image,
      dataUrl,
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
  };
  image.onerror = () => {
    onError({
      status: 'ERROR',
      errorMessage: 'Image failed to load',
      image: document.createElement('img'),
      width: 0,
      height: 0,
    });
  };

  fetch(imageUrl)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.blob();
    })
    .then((blob) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        dataUrl = reader.result as string; // ABK gosh this assumptions
        image.src = dataUrl;
      };
    })
    .catch((reason) => {
      onError({
        status: 'ERROR',
        errorMessage: reason,
        image: image,
        width: 0,
        height: 0,
      });
    });

  return {
    status: 'LOADING',
    image,
    width: 0,
    height: 0,
  };
};
