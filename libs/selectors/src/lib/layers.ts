import { ApplicationLayout } from '@neo4j-arrows/model';

export interface State {
  applicationLayout: ApplicationLayout;
}

export const getEventHandlers = (state: State, eventName: string) => {
  return state.applicationLayout.layers.reduce((handlers, layer) => {
    const layerEvent = layer.eventHandlers[eventName];
    if (layerEvent) {
      return handlers.concat([layerEvent]);
    } else {
      return handlers;
    }
  }, []);
};
