import { fetchingGraph, fetchingGraphSucceeded } from "../actions/neo4jStorage";
import config from "../config";
import { Point } from "../model/Point";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export function fetchGraphFromDrive(fileId) {
  return function (dispatch) {
    dispatch(fetchingGraph())

    const fetchData = () => downloadFile(fileId, graph => {
      dispatch(fetchingGraphSucceeded(constructGraphFromFile(graph)))
    })

    window.gapi.client.init({
      apiKey: config.apiKey,
      clientId: config.clientId,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(() => {
      if (window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
        fetchData()
      } else {
        window.gapi.auth2.getAuthInstance().signIn();
        fetchData()
      }
    })
  }
}

const downloadFile = (fileId, callback) => {
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
  var accessToken = window.gapi.auth.getToken().access_token
  var xhr = new XMLHttpRequest();
  xhr.open('GET', downloadUrl)
  xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken)
  xhr.onload = () => {
    callback(xhr.responseText)
  }
  xhr.onerror = error => callback({ error })
  xhr.send()
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
