import {Point} from "../model/Point";

const snapTolerance = 20

const snapToDistancesAndAngles = (graph, excludedNodeId, naturalPosition) => {
  let x = naturalPosition.x, y = naturalPosition.y
  let columns = [], rows = [], rings = [];
  graph.nodes.forEach((node) => {
    if (!node.idMatches(excludedNodeId)) {
      columns.push({
        x: node.position.x,
        error: Math.abs(naturalPosition.x - node.position.x)
      })
      rows.push({
        y: node.position.y,
        error: Math.abs(naturalPosition.y - node.position.y)
      })
      let distance = node.position.vectorFrom(naturalPosition).distance();
      graph.nodes.forEach((neighbour) => {
        if (!neighbour.idMatches(excludedNodeId)) {
          let radius = node.position.vectorFrom(neighbour.position).distance();
          rings.push({
            node,
            radius,
            error: Math.abs(distance - radius)
          })
        }
      })
    }
  })
  const byAscendingError = (a, b) => a.error - b.error;
  columns.sort(byAscendingError)
  rows.sort(byAscendingError)
  rings.sort(byAscendingError)

  let guidelines = []
  if (columns[0] && columns[0].error < snapTolerance) {
    x = columns[0].x
    guidelines.push({type: 'VERTICAL', x})
  }
  if (rows[0] && rows[0].error < snapTolerance) {
    y = rows[0].y
    guidelines.push({type: 'HORIZONTAL', y})
  }
  while (guidelines.length < 2 && rings.length > 0 && rings[0].error < snapTolerance) {
    let ring = rings.shift()
    let constraintPossible = true
    if (guidelines.length === 0) {
      let offset = naturalPosition.vectorFrom(ring.node.position)
      let positionOnCircle = ring.node.position.translate(offset.scale(ring.radius / offset.distance()))
      x = positionOnCircle.x
      y = positionOnCircle.y
    } else {
      let otherGuide = guidelines[0]
      let dx, dy
      switch (otherGuide.type) {
        case 'VERTICAL':
          dx = Math.abs(ring.node.position.x - otherGuide.x)
          if (dx > ring.radius) {
            constraintPossible = false
          } else {
            dy = Math.sqrt(ring.radius * ring.radius - dx * dx)
            y = ring.node.position.y < y ? ring.node.position.y + dy : ring.node.position.y - dy
          }
          break

        case 'HORIZONTAL':
          dy = Math.abs(ring.node.position.y - otherGuide.y)
          if (dy > ring.radius) {
            constraintPossible = false
          } else {
            dx = Math.sqrt(ring.radius * ring.radius - dy * dy)
            x = ring.node.position.x < x ? ring.node.position.x + dx : ring.node.position.x - dx
          }
          break

        case 'CIRCLE':
          let betweenCenters = ring.node.position.vectorFrom(otherGuide.center)
          let d = betweenCenters.distance()
          if (d > Math.abs(ring.radius - otherGuide.radius) && d < ring.radius + otherGuide.radius) {
            let a = (otherGuide.radius * otherGuide.radius - ring.radius * ring.radius + d * d) / (2 * d)
            let midPoint = otherGuide.center.translate(betweenCenters.scale(a / d))
            let h = Math.sqrt(otherGuide.radius * otherGuide.radius - a * a)
            let bisector = betweenCenters.perpendicular().scale(h / d)
            let intersections = [midPoint.translate(bisector), midPoint.translate(bisector.invert())]
            let errors = intersections.map((point) => point.vectorFrom(naturalPosition).distance())
            let intersection = errors[0] < errors[1] ? intersections[0] : intersections[1]
            x = intersection.x
            y = intersection.y
          } else {
            constraintPossible = false
          }
      }
    }
    if (constraintPossible) guidelines.push({type: 'CIRCLE', center: ring.node.position, radius: ring.radius})
  }

  return {
    snapped: guidelines.length > 0,
    guidelines: guidelines,
    snappedPosition: new Point(x, y)
  }
}

export default snapToDistancesAndAngles