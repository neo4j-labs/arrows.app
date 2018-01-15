
class NodePair {
  constructor (body, nodeA, nodeB) {
    this.body = body
    this.edges = []
    this.order = {}
    if (nodeA === nodeB) {
      this.nodeId = nodeA
    } else {
      this.nodeIds = [nodeA, nodeB]
    }
  }

  addEdge (edgeId, reversedOrder) {
    let index = this.edges.indexOf(edgeId)

    if (index !== -1) {
      throw new Error('Edge is already part of this NodePair')
    }
    this.edges.push(edgeId)
    this.order[edgeId] = !reversedOrder
  }

  getDeflectionMultiplier (edgeId) {
    if (typeof edgeId === 'undefined') {
      throw new Error('No Edge Given in getDeflectionMultiplier')
    }

    let index = this.edges.indexOf(edgeId)

    if (index === -1) {
      throw new Error('Edge is not added to NodePair ')
    }

    let count = this.edges.length
    let topMostDeflection = -(count - 1) * 0.5
    let deflection = topMostDeflection + index

    // Edges going the other way will have a opposite normal vector and thus needs to calulate deflection inverted
    if (!this.order[edgeId]) {
      deflection *= -1
    }

    return deflection
  }

  /*
   * Get position information for an edge that is looping
   */
  getSelfReferringPosition (edgeId, loopLength, selfReferringAngle, fromArrowGap, toArrowGap) {
    let node = this.body.nodes[this.nodeId]
    let gapForEdge = this.loopInfo[edgeId]
    const angleDeviation = (selfReferringAngle / 180) * Math.PI / 2

    const flattness = Math.atan(angleDeviation) * loopLength

    let newCenterAngle = gapForEdge.start + gapForEdge.size * 0.5
    let newSideAngles = [newCenterAngle - angleDeviation, newCenterAngle + angleDeviation]

    let vectorToCenter = {
      x: Math.cos(newCenterAngle),
      y: Math.sin(newCenterAngle)
    }

    let vectorNormalToCenter = {
      x: Math.sin(newCenterAngle),
      y: Math.cos(newCenterAngle)
    }

    let centerPos = {
      x: vectorToCenter.x * loopLength + node.x,
      y: vectorToCenter.y * loopLength + node.y
    }

    let labelAngle = newCenterAngle

    while (labelAngle < 0) {
      labelAngle += Math.PI * 2
    }

    let labelPosition = {
      x: centerPos.x,
      y: centerPos.y
    }

    if (labelAngle < Math.PI * 1.0) {
      labelAngle -= 0.5 * Math.PI
      labelPosition.adjustment = -1
    } else {
      labelAngle -= 1.5 * Math.PI
      labelPosition.adjustment = 1
    }

    let newPosition = {
      start: {
        x: Math.cos(newSideAngles[0]) * (node.radius + fromArrowGap) + node.x,
        y: Math.sin(newSideAngles[0]) * (node.radius + fromArrowGap) + node.y,
        angle: newSideAngles[0] + Math.PI
      },
      startVia: {
        x: centerPos.x + vectorNormalToCenter.x * flattness,
        y: centerPos.y - vectorNormalToCenter.y * flattness
      },
      center: {
        x: centerPos.x,
        y: centerPos.y
      },
      endVia: {
        x: centerPos.x - vectorNormalToCenter.x * flattness,
        y: centerPos.y + vectorNormalToCenter.y * flattness
      },
      end: {
        x: Math.cos(newSideAngles[1]) * (node.radius + toArrowGap) + node.x,
        y: Math.sin(newSideAngles[1]) * (node.radius + toArrowGap) + node.y,
        angle: newSideAngles[1] + Math.PI
      },
      labelAngle: labelAngle,
      labelPosition: labelPosition
    }

    return newPosition
  }
}

export default NodePair
