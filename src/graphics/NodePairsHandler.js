import NodePair from './NodePair'

/**
 * Node Pairs Handler is the main driver and owner of the process of bundling edges together in Node Pairs
 */
class NodePairsHandler {
  constructor (body) {
    this.body = body
    this.nodePairs = {}
  }

  destroy () {
    delete this.body
    delete this.nodePairs
  }

  getName () {
    return 'nodePairsHandler'
  }

  /* Get the node pair that corresponds to the combination of two nodes */
  getNodePair (from, to) {
    if (this.nodePairs[from] && this.nodePairs[from][to]) {
      return this.nodePairs[from][to]
    }
    if (this.nodePairs[to] && this.nodePairs[to][from]) {
      return this.nodePairs[to][from]
    }

    throw new Error('Unexcepted node pair asked for')
  }

  /* Reset the nodepairs and recreate them */
  updateNodePairs () {
    this.nodePairs = {}

    const nodeArray = Object.values(this.body.nodes)
    for (let node of nodeArray) {
      node.edges = []
    }

    const relArray = Object.values(this.body.relationships)
    for (let rel of relArray) {
      this._attach(rel)
    }
  }

  /*
   * Attach an edge to the appropriate nodePair, create the node pair if it doesn't exist
   */
  _attach (edge) {
    if (!edge) {
      throw new Error('No Edge Given in to attach')
    }

    if (!edge.isAttached) {
      return
    }

    let fromNode = edge.from
    let toNode = edge.to
    let from = fromNode.id
    let to = toNode.id

    fromNode.edges.push(edge)
    if (fromNode !== toNode) {
      toNode.edges.push(edge)
    }

    let nodeA
    let nodeB
    let reversed // /< If the arrow ends at the node some calculations are inverted

    /*
     * NodePairs exist in a wo dimensional field,
     * only one of the combination [a][b] or [b][a] ever should exist
     * The edge should be attached to the one regardless of direction
     * but the order matters for some calulations so if [b][a] is used
     * store the edge with the information "reversed"
     */

    // First check if the reversed combination already exist
    if (this.nodePairs[to] && this.nodePairs[to][from]) {
      // If so use that
      nodeA = to
      nodeB = from
      reversed = true
    } else {
      // If not then start with the first node,
      // regardless of whether that exist or not
      nodeA = from
      nodeB = to
      reversed = false
    }

    /* Now we have an order, create the node pair if it desn't exist   */
    if (this.nodePairs[nodeA] === undefined) {
      this.nodePairs[nodeA] = {}
    }
    if (this.nodePairs[nodeA][nodeB] === undefined) {
      this.nodePairs[nodeA][nodeB] = new NodePair(this.body, nodeA, nodeB)
    }

    // Add the edge to the node paid
    this.nodePairs[nodeA][nodeB].addEdge(edge.id, reversed)
  }

  /* Set up a sorted array of all the angles that each edge meets the node at -
   * for nodes that are not self referring
   */
  _getCircleAnglesForEachNonLoopEdge (node) {
    let angles = []

    node.edges.forEach((edge) => {
      let positionOnCircle

      if (edge.from.options.id === edge.to.options.id) {
        // Looping edges are not to be included
        return
      }

      // Use the point already calculated for each node of position on the circle
      // These calculations are based on the _updateEndPointsWithGap
      // And as such is not really generic - assume here that it's acceptable
      // otherwise that would have to be calculated first for each case
      if (edge.from.options.id === node.options.id) {
        positionOnCircle = edge.fromPoint
      } else if (edge.to.options.id === node.options.id) {
        positionOnCircle = edge.toPoint
      } else {
        throw new Error('This edge is not supposed to be here')
      }

      let deltaPoint = {
        x: positionOnCircle.x - node.x,
        y: positionOnCircle.y - node.y
      }

      angles.push(Math.atan2(deltaPoint.y, deltaPoint.x))
    })

    angles.sort((a, b) => (a - b))
    return angles
  }

  /* Set up a sorted array of all the gaps between the (non self-referring) edges for a node
   */
  _getSortedGapsBetweenEdgesForNode (node) {
    let gaps = []
    let angles = this._getCircleAnglesForEachNonLoopEdge(node)

    // If there are no edges (that doesn't loop) use the whole circle as one gap
    if (angles.length === 0) {
      gaps.push({
        size: Math.PI * 2,
        start: 0
      })
    } else {
      // Go through the angles one by one and calculate the gap to the next one
      for (var i = angles.length - 1; i >= 0; i--) {
        let gap
        let start
        if (i === 0) {
          // wrapping
          start = angles[angles.length - 1]
          gap = angles[i] - angles[angles.length - 1] + Math.PI * 2
        } else {
          start = angles[i - 1]
          gap = angles[i] - angles[i - 1]
        }

        gaps.push({
          size: gap,
          start: start
        })
      }

      gaps.sort((a, b) => (b.size - a.size))
    }

    return gaps
  }

  _distributeGaps (gaps, loopEdges) {
    let gapPerEdge = {}

    // If there are fewer gaps than number of loops continue to split
    // If there are enough gaps but the first large ones can harbour more than one loop also split
    while (loopEdges.length > gaps.length ||
           gaps[0].size > gaps[loopEdges.length - 1].size * 2) {
      // This algortihm is not the effective, but for up to three loop edges
      // it is acceptable - after that the distribution is not super
      // but as long as the order is not important it's probably ok

      // probably a better algorithm would take into account splitting into three
      // perhaps if gaps[0] > gaps[loopEdges.length - 2] * 3
      // or something like that - but it also becomes fairly arbitrary
      // if that should be taken into account I think we should look up some standard

      // It also doesn't take the width of the loop itself into account
      // resulting in to large margins between the loops - again probably acceptable

      gaps.push({
        size: gaps[0].size / 2,
        start: gaps[0].start
      })

      gaps.push({
        size: gaps[0].size / 2,
        start: gaps[0].start + gaps[0].size / 2
      })

      gaps.shift()

      // resort to get the newly split on their correct place
      gaps.sort((a, b) => (b.size - a.size))
    }

    loopEdges.forEach((edgeId, index) => {
      gapPerEdge[edgeId] = gaps[index]
    })

    return gapPerEdge
  }

  prepareDraw (relArray) {
    // Here we might want to do prep of non-self-referring edges
    // before rendering (at least first time) the to/fromPoint is not correct
    // but really it should be done in the frame before the selfreferring are done

    let nodesWithLoopEdges = {}
    let loopingEdges = []
    let nonLoopingEdges = []

    // This walkthrough has two reasons
    // 1. To pickup the nodes that have looping edges (which need special treatment)
    // 2. To separate the edges into a normal and a looping array
    for (let edge of relArray) {
      if (!edge.isAttached) {
        continue
      }
      let fromId = edge.from.id
      let toId = edge.to.id
      if (fromId === toId) {
        let nodeId = toId
        let node = this.body.nodes[nodeId]
        if (node !== undefined) {
          if (nodesWithLoopEdges[nodeId] === undefined) {
            nodesWithLoopEdges[nodeId] = {
              id: nodeId,
              edges: []
            }
          }
          nodesWithLoopEdges[nodeId].edges.push(edge.id)
        }
        loopingEdges.push(edge)
      } else {
        nonLoopingEdges.push(edge)
      }
    }

    // Go through the non looping edges and prepare them with the center points from the node pairs
    nonLoopingEdges.forEach((edge) => {
      if (edge.from && edge.to && typeof edge.prepareDraw === 'function') {
        edge.prepareDraw(edge.getFormattingValues())
      }
    })

    // If there are any looping edges at all
    if (loopingEdges.length > 0) {
      // First go through and calculate the gaps for the loops
      Object.keys(nodesWithLoopEdges).forEach((nodeId) => {
        let node = this.body.nodes[nodeId]
        let gaps = this._getSortedGapsBetweenEdgesForNode(node)

        nodesWithLoopEdges[nodeId]['gaps'] = this._distributeGaps(gaps, nodesWithLoopEdges[nodeId].edges)

        this.nodePairs[nodeId][nodeId].loopInfo = nodesWithLoopEdges[nodeId]['gaps']
      })

      // Then let the loop edges run with these values
      loopingEdges.forEach((edge) => {
        if (edge.from && edge.to && typeof edge.prepareDraw === 'function') {
          edge.prepareDraw(edge.getFormattingValues())
        }
      })
    }
  }
}

export default NodePairsHandler
