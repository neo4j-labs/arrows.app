export const getEventHandlers = (state, eventName) => {
  return state.applicationLayout.layers.reduce((handlers, layer) => {
    const layerEvent = layer.eventHandlers[eventName]
    if (layerEvent) {
      return handlers.concat([layerEvent])
    } else {
      return handlers
    }
  }, [])
}