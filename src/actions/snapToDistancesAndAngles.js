import {Point} from "../model/Point";

const snapToDistancesAndAngles = (graph, excludedNodeId, naturalPosition) => {
  let x = naturalPosition.x, y = naturalPosition.y

  let columns = [];
  graph.nodes.forEach((node) => {
    if (!node.idMatches(excludedNodeId)) {
      columns.push({
        x: node.position.x,
        distance: Math.abs(naturalPosition.x - node.position.x)
      })
    }
  })
  columns.sort((a, b) => a.distance - b.distance)

  let guidelines = []
  if (columns[0] && columns[0].distance < 20) {
    x = columns[0].x
    guidelines.push({type: 'VERTICAL', x})
  }

  return {
    guidelines: guidelines,
    snappedPosition: new Point(x, y)
  }
}

export default snapToDistancesAndAngles