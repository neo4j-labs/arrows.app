const key_helpDismissed = "neo4j-arrows-app.helpDismissed";
const key_rememberedConnectionParameters = "neo4j-arrows-app.rememberedConnectionParameters";

export const rememberHelpDismissed = () => {
  const serializedVal = JSON.stringify(true)
  localStorage.setItem(key_helpDismissed, serializedVal)
}

export const retrieveHelpDismissed = () => {
  const serializedVal = localStorage.getItem(key_helpDismissed)
  return !!JSON.parse(serializedVal)
}

export const rememberConnectionParameters = (connectionParameters) => {
  const serializedVal = JSON.stringify(connectionParameters)
  localStorage.setItem(key_rememberedConnectionParameters, serializedVal)
}

export const retrieveConnectionParameters = () => {
  const serializedVal = localStorage.getItem(key_rememberedConnectionParameters)
  return JSON.parse(serializedVal)
}

export const forgetConnectionParameters = () => {
  localStorage.removeItem(key_rememberedConnectionParameters)
}
