import {constructGraphFromFile} from "../storage/googleDriveStorage"
import {gettingGraph, gettingGraphSucceeded} from "./storage";
import {gettingDiagramNameSucceeded} from "./diagramName";

const key_helpDismissed = "neo4j-arrows-app.helpDismissed";
const key_rememberedConnectionParameters = "neo4j-arrows-app.rememberedConnectionParameters";
const key_recentlyAccessedDiagrams = "neo4j-arrows-app.recentlyAccessedDiagrams";
export const key_appData = "neo4j-arrows-app.appData";

export const rememberHelpDismissed = () => save(key_helpDismissed, true)

export const retrieveHelpDismissed = () => !!load(key_helpDismissed)

export const rememberConnectionParameters = connectionParameters =>
  save(key_rememberedConnectionParameters, connectionParameters)

export const retrieveConnectionParameters = () => load(key_rememberedConnectionParameters)

export const forgetConnectionParameters = () => {
  localStorage.removeItem(key_rememberedConnectionParameters)
}

const save = (key, value) => {
  localStorage.setItem(
    key,
    JSON.stringify(value))
}

const load = key => {
  const serializedVal = localStorage.getItem(key)
  return JSON.parse(serializedVal)
}

export const loadGraphFromLocalStorage = (fileId) => {
  return function (dispatch) {
    dispatch(gettingGraph())

    const data = load(fileId)
    const graphData = constructGraphFromFile(data)

    if (data.diagramName) {
      dispatch(gettingDiagramNameSucceeded(data.diagramName))
    }
    dispatch(gettingGraphSucceeded(graphData.graph))
  }
}

export const saveGraphToLocalStorage = (fileId, data) => {
  save(fileId, data)
}

export const loadRecentlyAccessedDiagrams = () => {
  return load(key_recentlyAccessedDiagrams)
}

export const saveRecentlyAccessedDiagrams = (data) => {
  save(key_recentlyAccessedDiagrams, data)
}
