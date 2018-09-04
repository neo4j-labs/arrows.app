import { fetchingGraph, fetchingGraphSucceeded } from "../actions/neo4jStorage";
import config from "../config";
import { Point } from "../model/Point";
import { setFileMetadata } from "../actions/storage";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive';

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
          const fullName = JSON.parse(fileMetadata).name
          const name = fullName.slice(0, fullName.lastIndexOf('.json'))
          dispatch(setFileMetadata(name))
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
    })
  }
}

const getFileInfo = (fileId, metaOnly = false) => {
  return new Promise((resolve, reject) => {
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}${metaOnly ? '' : '?alt=media'}`
    var accessToken = window.gapi.auth.getToken().access_token
    var xhr = new XMLHttpRequest();
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
