export const generateLocalFileId = () => {
  const array = new Uint8Array(15);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCodePoint(...array))
    .substring(0, 20)
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};
