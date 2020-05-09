import { constructGraphFromFile } from "../storage/googleDriveStorage"
import { loadClusters } from "./gang"
import { fetchingGraphSucceeded } from "./neo4jStorage"
import { useLocalStorage } from "./storage"

const key_helpDismissed = "neo4j-arrows-app.helpDismissed";
const key_rememberedConnectionParameters = "neo4j-arrows-app.rememberedConnectionParameters";
const key_appData = "neo4j-arrows-app.appData";

export const rememberHelpDismissed = () => save(key_helpDismissed, true)

export const retrieveHelpDismissed = () => !!load(key_helpDismissed)

export const rememberConnectionParameters = connectionParameters =>
  save(key_rememberedConnectionParameters, connectionParameters)

export const retrieveConnectionParameters = () => load(key_rememberedConnectionParameters)

export const forgetConnectionParameters = () => {
  localStorage.removeItem(key_rememberedConnectionParameters)
}

export const saveAppData = data => {
  save(key_appData, data)
}

export const loadAppData = () => load(key_appData)

const save = (key, value, stringify = true) => {
  localStorage.setItem(
    key,
    stringify ? JSON.stringify(value) : value)
}

const load = (key, parse = true) => {
  const serializedVal = localStorage.getItem(key)
  return parse ? JSON.parse(serializedVal) : serializedVal
}

export const initFromLocalStorage = () => {
  return function (dispatch) {
    const data = loadAppData()
    const graphData = constructGraphFromFile(data, false)

    dispatch(useLocalStorage())
    graphData.gangs && dispatch(loadClusters(graphData.gangs))
    dispatch(fetchingGraphSucceeded(graphData.graph))
  }
}

