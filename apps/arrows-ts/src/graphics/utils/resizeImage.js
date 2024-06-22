export const shrinkImageUrl = async (base64Data, targetBytes) => {
  if (base64Data.length < targetBytes) {
    return base64Data;
  }

  const shrinkRatio = Math.sqrt(targetBytes / base64Data.length);
  const image = await loadAsImage(base64Data);
  return scaleImage(image, shrinkRatio);
};

const loadAsImage = (base64Data) => {
  return new Promise((resolve, reject) => {
    const image = document.createElement('img');
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject('Failed to load image');
    };
    image.src = base64Data;
  });
};

const scaleImage = (image, ratio) => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, image.naturalWidth * ratio);
  canvas.height = Math.max(1, image.naturalHeight * ratio);

  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL();
};
