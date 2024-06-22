import {
  ApplicationLayout,
  EntitySelection,
  Graph,
  selectedNodes,
} from '@neo4j-arrows/model';

export interface GetSelectedNodesArgs {
  graph: Graph;
  gangs: any;
  selection: EntitySelection;
  applicationLayout: ApplicationLayout;
}

export const getSelectedNodes = ({
  graph,
  gangs,
  selection,
  applicationLayout,
}: GetSelectedNodesArgs) => {
  const regularNodes = selectedNodes(graph, selection);

  if (applicationLayout.layers && applicationLayout.layers.length > 0) {
    const selectedNodes = applicationLayout.layers.reduce(
      (resultNodes, layer) => {
        if (layer.selectorForInspection) {
          return resultNodes.concat(
            layer.selectorForInspection({ graph, gangs, selection })
          );
        } else {
          return resultNodes;
        }
      },
      []
    );
    return regularNodes.concat(selectedNodes);
  } else {
    return regularNodes;
  }
};
