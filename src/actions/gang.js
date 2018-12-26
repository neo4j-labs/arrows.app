import { getCommonCaption } from "../model/gang"
import { idsMatch, nextAvailableId } from "../model/Id"
import { moveNodes, tryMoveHandle, tryMoveNode } from "./graph"
import { clearSelection, ensureDeselected } from "./selection";
import { Guides } from "../graphics/Guides";
import { activateRing, deactivateRing, tryDragRing } from "./dragToCreate";
import { setMarquee } from "./selectionMarquee";
import { pan } from "./viewTransformation";
import { getGraph } from "../selectors";

export const createClusterGang = (nodePositions, initialPositions) => (dispatch, getState) => {
  const { graph } = getState()
  const combinedNodeIds = nodePositions.map(nodePos => nodePos.nodeId)
  const combinedNodes = graph.nodes.filter(node => combinedNodeIds.includes(node.id))

  const commonCaption = getCommonCaption(combinedNodes)

  let { commonProps, caption } = commonCaption
  const commonKeys = Object.keys(commonProps)
  if (commonKeys.length > 0) {
    caption = commonProps[commonKeys[0]]
  }

  const superNodeId = nextAvailableId(graph.nodes)
  dispatch(clearSelection())
  dispatch(createCluster(superNodeId, caption, nodePositions[0].position, 'cluster', initialPositions))
  dispatch(moveNodes(null, null, initialPositions, new Guides(), true))
}

export const createCluster = (nodeId, caption, position, nodeType, initialPositions) => ({
  type: 'CREATE_CLUSTER',
  nodeId,
  caption,
  position,
  nodeType,
  properties: {},
  members: initialPositions,
  style: {
    'radius': 50,
    'node-color': '#FFF',
    'border-width': '2',
    'caption-color': '#000'
  },
  initialPosition: position
})

export const removeClusterGang = nodeId => (dispatch, getState) => {
  const { gangs, selection } = getState()
  const cluster = gangs.find(gang => gang.id === nodeId)

  if (!cluster.position.isEqual(cluster.initialPosition)) {
    const newMemberPositions = cluster.members.map(nodePos => ({
      nodeId: nodePos.nodeId,
      position: nodePos.position.translate(cluster.position.vectorFrom(cluster.initialPosition))
    }))

    dispatch(moveNodes(null, null, newMemberPositions, new Guides(), true))
  }

  if(selection.selectedNodeIdMap[nodeId]) {
    dispatch(ensureDeselected([nodeId]))
  }

  dispatch(removeCluster(nodeId))
}

export const removeCluster = nodeId => ({
  type: 'REMOVE_CLUSTER',
  nodeId
})

export const mouseMove = ({mouse, dispatch}) => {
  switch (mouse.dragType) {
    case 'NODE_RING':
      if (mouse.node && mouse.node.type === 'cluster') {
        return true
      }
    default:
      return false
  }
  return false
}

export const mouseUp = ({state, dispatch}) => {
  const { mouse, gestures } = state
  const graph = getGraph(state)

  switch (mouse.dragType) {
    case 'NODE_RING':
      const dragToCreate = gestures.dragToCreate;

      if (dragToCreate.sourceNodeId) {
        const sourceNode = graph.nodes.find((node) => idsMatch(node.id, dragToCreate.sourceNodeId))
        if (sourceNode.type === 'cluster') {
          dispatch(removeClusterGang(sourceNode.id))
          return true
        }
      }
      break
    default:
      break
  }
  return false
}