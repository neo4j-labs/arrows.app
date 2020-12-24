import { constructGraphFromFile } from "../storage/googleDriveStorage"
import { gettingGraphSucceeded } from "./storage";
import {setDiagramName} from "./diagramName";

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

const save = (key, value) => {
  localStorage.setItem(
    key,
    JSON.stringify(value))
}

const load = key => {
  const serializedVal = localStorage.getItem(key)
  return JSON.parse(serializedVal)
}

export const loadGraphFromLocalStorage = () => {
  return function (dispatch) {
    const data = loadAppData()
    const graphData = constructGraphFromFile(data)

    if (data.diagramName) {
      dispatch(setDiagramName(data.diagramName))
    }
    dispatch(gettingGraphSucceeded(graphData.graph))
  }
}

