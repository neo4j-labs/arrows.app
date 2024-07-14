import { imageAttributes } from '@neo4j-arrows/model';
import { containsCachedImage, loadImage } from '../graphics/utils/ImageCache';
import { imageEvent } from '../actions/cachedImages';
import { getPresentGraph } from '@neo4j-arrows/graphics';

export const imageCacheMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.category === 'GRAPH') {
    const state = store.getState();
    const graph = getPresentGraph(state);
    const cachedImages = state.cachedImages;

    const referencedImageUrls = collectImageUrlsFromGraph(graph);
    for (const imageUrl of referencedImageUrls) {
      if (!containsCachedImage(cachedImages, imageUrl)) {
        const loadingImage = loadImage(
          imageUrl,
          (cachedImage) => {
            store.dispatch(imageEvent(imageUrl, cachedImage));
          },
          (errorImage) => {
            store.dispatch(imageEvent(imageUrl, errorImage));
          }
        );
        store.dispatch(imageEvent(imageUrl, loadingImage));
      }
    }
  }

  return result;
};

const collectImageUrlsFromGraph = (graph) => {
  const imageUrls = new Set();
  collectImageUrlsFromStyle(imageUrls, graph.style);
  for (const node of graph.nodes) {
    collectImageUrlsFromStyle(imageUrls, node.style);
  }
  for (const relationship of graph.relationships) {
    collectImageUrlsFromStyle(imageUrls, relationship.style);
  }
  return imageUrls;
};

const collectImageUrlsFromStyle = (imageUrls, style) => {
  for (const [key, value] of Object.entries(style)) {
    if (imageAttributes.includes(key) && value) {
      imageUrls.add(value);
    }
  }
};
