import {
  importNodesAndRelationships,
  setArrowsProperty,
  setGraphStyle,
} from './graph';
import { Point } from '../model/Point';
import { getOntologies, getPresentGraph } from '../selectors';
import { constructGraphFromFile } from '../storage/googleDriveStorage';
import { translate } from '@neo4j-arrows/model';
import { Vector } from '../model/Vector';
import { hideImportDialog } from './applicationDialogs';
import { shrinkImageUrl } from '../graphics/utils/resizeImage';
import { Base64 } from 'js-base64';
import { toGraph } from '@neo4j-arrows/linkml';
import { load } from 'js-yaml';

export const tryImport = (dispatch) => {
  return function (text, separation, ontologies) {
    let importedGraph;

    const format = formats.find((format) => format.recognise(text));
    if (format) {
      try {
        importedGraph = format.parse(text, separation, ontologies);
      } catch (e) {
        return {
          errorMessage: e.toString(),
        };
      }
    } else {
      return {
        errorMessage: 'No format found',
      };
    }

    dispatch(importNodesAndRelationships(importedGraph));
    dispatch(hideImportDialog());
    return {};
  };
};

export const interpretClipboardData = (
  clipboardData,
  nodeSpacing,
  ontologies,
  handlers
) => {
  const textPlainMimeType = 'text/plain';
  if (clipboardData.types.includes(textPlainMimeType)) {
    const text = clipboardData.getData(textPlainMimeType);
    const format = formats.find((format) => format.recognise(text));
    if (format) {
      try {
        switch (format.outputType) {
          case 'graph':
            // eslint-disable-next-line no-case-declarations
            const importedGraph = format.parse(text, nodeSpacing, ontologies);
            handlers.onGraph && handlers.onGraph(importedGraph);
            break;

          case 'svg':
            // eslint-disable-next-line no-case-declarations
            const svgImageUrl = format.parse(text);
            handlers.onSvgImageUrl && handlers.onSvgImageUrl(svgImageUrl);
            break;
        }
      } catch (e) {
        console.error(e);
      }
    }
  } else if (clipboardData.types.includes('Files')) {
    const reader = new FileReader();
    reader.readAsDataURL(clipboardData.files[0]);
    reader.onloadend = function () {
      const imageUrl = reader.result;
      handlers.onPngImageUrl && handlers.onPngImageUrl(imageUrl);
    };
  }
};

export const handlePaste = (pasteEvent) => {
  return function (dispatch, getState) {
    const state = getState();
    const separation = nodeSeparation(state);
    const ontologies = getOntologies(state).ontologies;
    const selection = state.selection;

    const clipboardData = pasteEvent.clipboardData;
    interpretClipboardData(clipboardData, separation, ontologies, {
      onGraph: (graph) => {
        dispatch(importNodesAndRelationships(graph));
      },
      onPngImageUrl: (imageUrl) => {
        if (selection.entities.length > 0) {
          shrinkImageUrl(imageUrl, 1024 * 10).then((shrunkenImageUrl) => {
            dispatch(
              setArrowsProperty(
                selection,
                'node-background-image',
                shrunkenImageUrl
              )
            );
          });
        } else {
          shrinkImageUrl(imageUrl, 1024 * 100).then((shrunkenImageUrl) => {
            dispatch(setGraphStyle('background-image', shrunkenImageUrl));
          });
        }
      },
      onSvgImageUrl: (imageUrl) => {
        if (selection.entities.length > 0) {
          dispatch(setArrowsProperty(selection, 'node-icon-image', imageUrl));
        } else {
          dispatch(setGraphStyle('background-image', imageUrl));
        }
      },
    });
  };
};

const formats = [
  {
    // LinkML
    recognise: (plainText) => {
      try {
        const linkml = load(plainText);
        const linkmlPrefix = Object.entries(linkml.prefixes).find(
          ([key, value]) => key === 'linkml'
        );
        return !!linkmlPrefix;
      } catch {
        return false;
      }
    },
    outputType: 'graph',
    parse: (plainText, separation, ontologies) => {
      const graph = toGraph(load(plainText), ontologies);
      const nodes = graph.nodes.map((node, index) => ({
        ...node,
        position: new Point(
          separation * Math.cos(360 * index),
          separation * Math.sin(360 * index)
        ),
        style: {},
      }));

      const relationships = graph.relationships.map((relationship) => ({
        ...relationship,
        style: {},
      }));

      const left = Math.min(...nodes.map((node) => node.position.x));
      const top = Math.min(...nodes.map((node) => node.position.y));
      const vector = new Vector(-left, -top);
      const originNodes = nodes.map((node) => translate(node, vector));
      return {
        ...graph,
        nodes: originNodes,
        relationships,
      };
    },
  },
  {
    // JSON
    recognise: (plainText) => new RegExp('^{.*}$', 's').test(plainText.trim()),
    outputType: 'graph',
    parse: (plainText) => {
      const object = JSON.parse(plainText);
      const graphData = constructGraphFromFile(object);
      const { nodes, relationships } = graphData.graph;
      const left = Math.min(...nodes.map((node) => node.position.x));
      const top = Math.min(...nodes.map((node) => node.position.y));
      const vector = new Vector(-left, -top);
      const originNodes = nodes.map((node) => translate(node, vector));
      return {
        nodes: originNodes,
        relationships,
      };
    },
  },
  {
    // SVG
    recognise: (plainText) => {
      const xmlDocument = new DOMParser().parseFromString(
        plainText.trim(),
        'image/svg+xml'
      );
      return xmlDocument.documentElement.tagName === 'svg';
    },
    outputType: 'svg',
    parse: (plainText) => {
      return 'data:image/svg+xml;base64,' + Base64.encode(plainText.trim());
    },
  },
  {
    // plain text
    recognise: (plainText) => plainText && plainText.length < 10000,
    outputType: 'graph',
    parse: (plainText, separation) => {
      const lines = plainText
        .split('\n')
        .filter((line) => line && line.trim().length > 0);

      const nodes = lines.flatMap((line, row) => {
        const cells = line.split('\t');
        return cells.map((cell, column) => {
          return {
            id: 'n' + lines.length * column + row,
            position: new Point(separation * column, separation * row),
            caption: cell,
            style: {},
            properties: {},
          };
        });
      });
      return {
        nodes,
        relationships: [],
      };
    },
  },
];

export const nodeSeparation = (state) => {
  const graph = getPresentGraph(state);
  return graph.style.radius * 2.5;
};
