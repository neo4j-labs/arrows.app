import { fetchingGraph, fetchingGraphSucceeded } from "../actions/neo4jStorage";
import config from "../config";
import { Point } from "../model/Point";
import { setDiagramName } from "../actions/diagramName";
import {DISCOVERY_DOCS, SCOPES} from "../actions/googleDrive";

export function fetchGraphFromDrive(fileId) {
  return function (dispatch) {
    dispatch(fetchingGraph())

    const fetchData = () => getFileInfo(fileId)
      .then(graph => {
        dispatch(fetchingGraphSucceeded(constructGraphFromFile(graph)))
      })

    const fetchFileName = () =>
      getFileInfo(fileId, true)
        .then(fileMetadata => {
          const fileName = JSON.parse(fileMetadata).name
          dispatch(setDiagramName(fileName))
        })

    window.gapi.client.init({
      apiKey: config.apiKey,
      clientId: config.clientId,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(() => {
      if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
        fetchFileName()
        fetchData()
      } else {
        window.gapi.auth2.getAuthInstance().signIn();
        fetchFileName()
        fetchData()
      }
    }, function(reason) {
      console.log('Error: ' + reason.result.error.message);
    })
  }
}

const getFileInfo = (fileId, metaOnly = false) => {
  return new Promise((resolve, reject) => {
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}${metaOnly ? '' : '?alt=media'}`
    const accessToken = window.gapi.auth.getToken().access_token
    const xhr = new XMLHttpRequest();
    xhr.open('GET', downloadUrl)
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken)
    xhr.onload = () => resolve(xhr.responseText)
    xhr.onerror = error => reject(error)
    xhr.send()
  })
}

const constructGraphFromFile = graphJson => {
  const graph = JSON.parse(graphJson)
  const nodes = graph.nodes.map(node => ({
    id: node.id,
    position: new Point(node.position.x, node.position.y),
    caption: node.caption,
    style: node.style,
    properties: node.properties,
  }))

  return {
    nodes,
    relationships: graph.relationships,
    style: graph.style
  }
}
