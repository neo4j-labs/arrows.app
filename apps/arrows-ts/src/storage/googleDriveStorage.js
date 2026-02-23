import { Point } from "../model/Point";
import { gettingDiagramNameSucceeded } from "../actions/diagramName";
import {completeWithDefaults} from "../model/styling";
import {emptyGraph} from "../model/Graph";
import {gettingGraph, gettingGraphSucceeded, gettingGraphFailed} from "../actions/storage";
import {clearGoogleDriveToken} from "../actions/googleDrive";

export function fetchGraphFromDrive(fileId) {
  return function (dispatch, getState) {
    const accessToken = getState().googleDrive?.accessToken;
    if (!accessToken) {
      return;
    }
    dispatch(gettingGraph());

    const on401 = () => dispatch(clearGoogleDriveToken());

    const fetchData = () => getFileInfo(fileId, false, accessToken, on401)
      .then(data => {
        const layers = constructGraphFromFile(JSON.parse(data));
        dispatch(gettingGraphSucceeded(layers.graph));
      })
      .catch(() => dispatch(gettingGraphFailed()));

    const fetchFileName = () =>
      getFileInfo(fileId, true, accessToken, on401)
        .then(fileMetadata => {
          const fileName = JSON.parse(fileMetadata).name;
          dispatch(gettingDiagramNameSucceeded(fileName));
        })
        .catch(() => {});

    fetchFileName();
    fetchData();
  };
}

const getFileInfo = (fileId, metaOnly = false, accessToken, on401) => {
  return new Promise((resolve, reject) => {
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true${metaOnly ? '' : '&alt=media'}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', downloadUrl);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onload = () => {
      if (xhr.status === 401) {
        on401?.();
        reject(new Error('Unauthorized'));
        return;
      }
      resolve(xhr.responseText);
    };
    xhr.onerror = () => reject(xhr);
    xhr.send();
  });
};

export const constructGraphFromFile = (data) => {
  let graph
  let gangs = []

  if (data) {
    if (data.graph) {
      graph = data.graph
      gangs = data.gangs || []
    } else {
      graph = data
    }
  } else {
    graph = emptyGraph()
  }

  const nodes = graph.nodes.map(node => ({
    id: node.id,
    position: new Point(node.position.x, node.position.y),
    caption: node.caption,
    labels: node.labels || [],
    properties: node.properties || {},
    style: node.style || {},
  }))

  const relationships = graph.relationships
    .filter(relationship =>
      nodes.some(node => node.id === relationship.fromId) &&
      nodes.some(node => node.id === relationship.toId))
    .map(relationship => ({
      id: relationship.id,
      fromId: relationship.fromId,
      toId: relationship.toId,
      type: relationship.type || '',
      properties: relationship.properties || {},
      style: relationship.style || {},
    }))

  gangs.forEach(cluster => {
    cluster.position = new Point(cluster.position.x, cluster.position.y)
    cluster.initialPosition = new Point(cluster.initialPosition.x, cluster.initialPosition.y)
    cluster.members.forEach(member => {
      member.position = new Point(member.position.x, member.position.y)
    })
  })

  return {
    graph: {
      nodes,
      relationships,
      style: completeWithDefaults(graph.style)
    },
    gangs
  }
}
