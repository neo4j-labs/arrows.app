import { ViewTransformation } from '../../state/ViewTransformation';
import { getBackgroundImage, getVisualGraph } from '@neo4j-arrows/graphics';
import { Vector } from '../../model/Vector';
import CanvasAdaptor from './CanvasAdaptor';

export const renderPngAtScaleFactor = (
  graph,
  cachedImages,
  scaleFactor,
  maxPixels,
  transparentBackground
) => {
  const renderState = {
    graph,
    cachedImages,
    selection: {
      entities: [],
    },
  };
  const visualGraph = getVisualGraph(renderState);
  const backgroundImage = getBackgroundImage(renderState);

  const boundingBox = visualGraph.boundingBox() || {
    left: 0,
    top: 0,
    right: 100,
    bottom: 100,
  };

  const canvas = window.document.createElement('canvas');
  const width = Math.ceil(scaleFactor * boundingBox.width);
  const height = Math.ceil(scaleFactor * boundingBox.height);

  if (width * height > maxPixels) {
    throw new Error('Too Big to render safely.');
  }

  const viewTransformation = new ViewTransformation(
    scaleFactor,
    new Vector(-scaleFactor * boundingBox.left, -scaleFactor * boundingBox.top)
  );
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const canvasAdaptor = new CanvasAdaptor(ctx);
  if (!transparentBackground) {
    ctx.fillStyle = visualGraph.style['background-color'];
    ctx.fillRect(0, 0, width, height);
  }
  backgroundImage.draw(canvasAdaptor, {
    viewTransformation,
  });
  visualGraph.draw(canvasAdaptor, {
    viewTransformation,
  });
  return {
    width,
    height,
    dataUrl: canvas.toDataURL(),
  };
};

export const renderPngForThumbnail = (graph, cachedImages) => {
  const renderState = {
    graph,
    cachedImages,
    selection: {
      entities: [],
    },
  };
  const visualGraph = getVisualGraph(renderState);
  const boundingBox = visualGraph.boundingBox() || {
    left: 0,
    top: 0,
    right: 100,
    bottom: 100,
  };

  // According to https://developers.google.com/drive/api/v3/file
  // the recommended width is 1600px and the maximum size is 2 MiB.
  // We assume that a 1600px square will take less than 2 MiB when encoded as PNG.
  const targetWidth = 1600;
  const maxPixels = targetWidth * targetWidth;
  const naturalPixels = boundingBox.width * boundingBox.height;
  const scaleFactor = Math.sqrt(maxPixels / naturalPixels);
  return renderPngAtScaleFactor(
    graph,
    cachedImages,
    scaleFactor,
    Infinity,
    false
  );
};
