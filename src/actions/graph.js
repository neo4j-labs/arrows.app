import {snapTolerance, snapToNeighbourDistancesAndAngles} from "./geometricSnapping";
import {Guides} from "../graphics/Guides";
import {idsMatch, nextAvailableId} from "../model/Id";
import {Point} from "../model/Point";

export const createNode = () => (dispatch, getState) => {
  const { viewTransformation, applicationLayout } = getState()
  const windowSize = applicationLayout.windowSize
  const randomPosition = new Point(Math.random() * windowSize.width, Math.random() * windowSize.height)

  dispatch({
    category: 'GRAPH',
    type: 'CREATE_NODE',
    newNodeId: nextAvailableId(getState().graph.nodes),
    newNodePosition: viewTransformation.inverse(randomPosition),
    caption: ''
  })
}

export const createNodeAndRelationship = (sourceNodeId, targetNodePosition) => (dispatch, getState) => {
  dispatch({
    category: 'GRAPH',
    type: 'CREATE_NODE_AND_RELATIONSHIP',
    sourceNodeId,
    newRelationshipId: nextAvailableId(getState().graph.relationships),
    targetNodeId: nextAvailableId(getState().graph.nodes),
    targetNodePosition,
    caption: ''
  })
}

export const connectNodes = (sourceNodeId, targetNodeId) => (dispatch, getState) => {
  dispatch({
    category: 'GRAPH',
    type: 'CONNECT_NODES',
    sourceNodeId,
    newRelationshipId: nextAvailableId(getState().graph.relationships),
    targetNodeId
  })
}

export const tryMoveHandle = ({corner, initialNodePositions, initialMousePosition, newMousePosition}) => {
  return function (dispatch, getState) {
    const { viewTransformation, mouse } = getState()

    const vector = newMousePosition.vectorFrom(initialMousePosition).scale(1 / viewTransformation.scale)
    const maxDiameter = Math.max(...initialNodePositions.map(entry => entry.radius)) * 2

    const dimensions = ['x', 'y']
    const ranges = {}

    const choose = (mode, min, max, other) => {
      switch (mode) {
        case 'min':
          return min
        case 'max':
          return max
        default:
          return other
      }
    }

    dimensions.forEach(dimension => {
      const coordinates = initialNodePositions.map(entry => entry.position[dimension])
      const min = Math.min(...coordinates)
      const max = Math.max(...coordinates)
      const oldSpread = max - min
      let newSpread = choose(
        corner[dimension],
        oldSpread - vector['d' + dimension],
        oldSpread + vector['d' + dimension],
        oldSpread
      )
      if (newSpread < 0) {
        if (newSpread < -maxDiameter) {
          newSpread += maxDiameter
        } else {
          newSpread = 0
        }
      }
      ranges[dimension] = {
        min,
        max,
        oldSpread,
        newSpread
      }
    })
    const snapRatios = [-1, 1]
    if (corner.x !== 'mid' && corner.y !== 'mid') {
      let ratio = Math.max(...dimensions.map(dimension => {
        const range = ranges[dimension]
        return range.newSpread / range.oldSpread;
      }))
      let smallestSpread = Math.min(...dimensions.map(dimension => ranges[dimension].oldSpread))
      snapRatios.forEach(snapRatio => {
        if (Math.abs(ratio - snapRatio) * smallestSpread < snapTolerance) {
          ratio = snapRatio
        }
      })
      dimensions.forEach(dimension => {
        const range = ranges[dimension]
        range.newSpread = range.oldSpread * ratio;
      })
    } else {
      dimensions.forEach(dimension => {
        const range = ranges[dimension]
        let ratio = range.newSpread / range.oldSpread
        snapRatios.forEach(snapRatio => {
          if (Math.abs(ratio - snapRatio) * range.oldSpread < snapTolerance) {
            ratio = snapRatio
          }
        })
        range.newSpread = range.oldSpread * ratio;
      })
    }

    const coordinate = (position, dimension) => {
      const original = position[dimension]
      const range = ranges[dimension]
      switch (corner[dimension]) {
        case 'min':
          return range.max - (range.max - original) * range.newSpread / range.oldSpread
        case 'max':
          return range.min + (original - range.min) * range.newSpread / range.oldSpread
        default:
          return original
      }
    }

    const nodePositions = initialNodePositions.map(entry => {
      return {
        nodeId: entry.nodeId,
        position: new Point(
          coordinate(entry.position, 'x'),
          coordinate(entry.position, 'y')
        )
      }
    })

    dispatch(moveNodes(initialMousePosition, newMousePosition || mouse.mousePosition, nodePositions, new Guides()))
  }
}

export const tryMoveNode = ({ nodeId, oldMousePosition, newMousePosition, forcedNodePosition }) => {
  return function (dispatch, getState) {
    const { graph, viewTransformation, mouse } = getState()
    let naturalPosition
    const otherSelectedNodes = Object.keys(getState().selection.selectedNodeIdMap).filter((selectedNodeId) => selectedNodeId !== nodeId)
    const activelyMovedNode = graph.nodes.find((node) => idsMatch(node.id, nodeId))

    if (forcedNodePosition) {
      naturalPosition = forcedNodePosition
    } else {
      const vector = newMousePosition.vectorFrom(oldMousePosition).scale(1 / viewTransformation.scale)
      let currentPosition = getState().guides.naturalPosition || activelyMovedNode.position

      naturalPosition = currentPosition.translate(vector)
    }

    let snaps = snapToNeighbourDistancesAndAngles(graph, nodeId, naturalPosition, otherSelectedNodes)
    let guides = new Guides()
    let newPosition = naturalPosition
    if (snaps.snapped) {
      guides = new Guides(snaps.guidelines, naturalPosition)
      newPosition = snaps.snappedPosition
    }
    const delta = newPosition.vectorFrom(activelyMovedNode.position)
    const nodePositions = [{
      nodeId,
      position: newPosition
    }]
    otherSelectedNodes.forEach((otherNodeId) => {
      nodePositions.push({
        nodeId: otherNodeId,
        position: graph.nodes.find((node) => idsMatch(node.id, otherNodeId)).position.translate(delta)
      })
    })

    dispatch(moveNodes(oldMousePosition, newMousePosition || mouse.mousePosition, nodePositions, guides))
  }
}

export const moveNodes = (oldMousePosition, newMousePosition, nodePositions, guides, autoGenerated) => {
  return {
    category: 'GRAPH',
    type: 'MOVE_NODES',
    oldMousePosition,
    newMousePosition,
    nodePositions,
    guides,
    autoGenerated
  }
}

export const moveNodesEndDrag = (nodePositions) => {
  return {
    category: 'GRAPH',
    type: 'MOVE_NODES_END_DRAG',
    nodePositions
  }
}

export const setNodeCaption = (selection, caption) => ({
  category: 'GRAPH',
  type: 'SET_NODE_CAPTION',
  selection,
  caption
})

export const renameProperty = (selection, oldPropertyKey, newPropertyKey) => ({
  category: 'GRAPH',
  type: 'RENAME_PROPERTY',
  selection,
  oldPropertyKey,
  newPropertyKey
})

export const setProperty = (selection, key, value) => ({
  category: 'GRAPH',
  type: 'SET_PROPERTY',
  selection,
  key,
  value
})

export const setArrowsProperty = (selection, key, value) => ({
  category: 'GRAPH',
  type: 'SET_ARROWS_PROPERTY',
  selection,
  key,
  value
})

export const removeProperty = (selection, key) => ({
  category: 'GRAPH',
  type: 'REMOVE_PROPERTY',
  selection,
  key
})

export const removeArrowsProperty = (selection, key) => ({
  category: 'GRAPH',
  type: 'REMOVE_ARROWS_PROPERTY',
  selection,
  key
})


export const setRelationshipType = (selection, relationshipType) => ({
  category: 'GRAPH',
  type: 'SET_RELATIONSHIP_TYPE',
  selection,
  relationshipType
})

export const deleteNodesAndRelationships = (nodeIdMap, relationshipIdMap) => ({
  category: 'GRAPH',
  type: 'DELETE_NODES_AND_RELATIONSHIPS',
  nodeIdMap,
  relationshipIdMap
})

export const deleteSelection = () => {
  return function (dispatch, getState) {
    const selection = getState().selection
    const relationships = getState().graph.relationships

    const nodeIdMap = {...selection.selectedNodeIdMap}
    const relationshipIdMap = {...selection.selectedRelationshipIdMap}

    relationships.forEach(relationship => {
      if (!relationshipIdMap[relationship.id] && (nodeIdMap[relationship.fromId] || nodeIdMap[relationship.toId])) {
        relationshipIdMap[relationship.id] = true
      }
    })

    dispatch(deleteNodesAndRelationships(nodeIdMap, relationshipIdMap))
  }
}