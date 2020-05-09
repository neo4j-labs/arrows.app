import { fetchingGraph, fetchingGraphSucceeded } from "../actions/neo4jStorage";
import { Point } from "../model/Point";
import { setDiagramName } from "../actions/diagramName";
import { loadClusters } from "../actions/gang"
import {completeWithDefaults} from "../model/styling";

export function fetchGraphFromDrive(fileId) {
  return function (dispatch) {
    dispatch(fetchingGraph())

    const fetchData = () => getFileInfo(fileId)
      .then(data => {
        const layers = constructGraphFromFile(data)
        layers.gangs && dispatch(loadClusters(layers.gangs))
        dispatch(fetchingGraphSucceeded(layers.graph))
      })

    const fetchFileName = () =>
      getFileInfo(fileId, true)
        .then(fileMetadata => {
          const fileName = JSON.parse(fileMetadata).name
          dispatch(setDiagramName(fileName))
        })

    fetchFileName()
    fetchData()
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

export const constructGraphFromFile = (graphData, isJson = true) => {
  const data = isJson ? JSON.parse(graphData) : graphData
  let graph
  let gangs = []

  if (data.graph) {
    graph = data.graph
    gangs = data.gangs || []
  } else {
    graph = data
  }

  const nodes = graph.nodes.map(node => ({
    id: node.id,
    position: new Point(node.position.x, node.position.y),
    caption: node.caption,
    style: node.style || {},
    labels: node.labels || [],
    properties: node.properties,
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
      relationships: graph.relationships,
      style: completeWithDefaults(graph.style)
    },
    gangs
  }
}
