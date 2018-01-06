import {Point} from "../model/Point";

const snapTolerance = 20

const snapToDistancesAndAngles = (graph, excludedNodeId, naturalPosition) => {
  let x = naturalPosition.x, y = naturalPosition.y
  let columns = [], rows = [];
  graph.nodes.forEach((node) => {
    if (!node.idMatches(excludedNodeId)) {
      columns.push({
        x: node.position.x,
        distance: Math.abs(naturalPosition.x - node.position.x)
      })
      rows.push({
        y: node.position.y,
        distance: Math.abs(naturalPosition.y - node.position.y)
      })
    }
  })
  const byDescendingDistance = (a, b) => a.distance - b.distance;
  columns.sort(byDescendingDistance)
  rows.sort(byDescendingDistance)

  let guidelines = []
  if (columns[0] && columns[0].distance < snapTolerance) {
    x = columns[0].x
    guidelines.push({type: 'VERTICAL', x})
  }
  if (rows[0] && rows[0].distance < snapTolerance) {
    y = rows[0].y
    guidelines.push({type: 'HORIZONTAL', y})
  }

  return {
    guidelines: guidelines,
    snappedPosition: new Point(x, y)
  }
}

export default snapToDistancesAndAngles