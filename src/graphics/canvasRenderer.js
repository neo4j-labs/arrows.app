import NeoEdge from './NeoEdge'
import NodePairsHandler from './NodePairsHandler'
import NeoNode from './NeoNode'

export function drawNode(ctx, position, color, size) {
  drawSolidCircle(ctx, position, color, size)
}

export function drawRelationships(ctx, graph, relConfig, displayOptions) {
  const nodes = graph.nodes.reduce((nodes, node) => {
    nodes[node.id.value] = new NeoNode(node, displayOptions.viewTransformation)
    return nodes
  }, {})

  const relsArray = []
  const body = { nodes, relationships: [] }
  const nodePairsHandler = new NodePairsHandler(body)
  body.relationships = graph.relationships.reduce((relationships, relationship) => {
    const neoEdge = new NeoEdge({
      ...relationship,
      from: nodes[relationship.fromId],
        to: nodes[relationship.toId]
      },
      {
        relConfig,
        nodePairsHandler
      })
    relationships[relationship.id] = neoEdge
    relsArray.push(neoEdge)
    return relationships
  }, {})

  nodePairsHandler.updateNodePairs()

  relsArray.forEach(rel => rel.updateEndPoints(false))

  nodePairsHandler.prepareDraw(relsArray)

  relsArray.forEach(rel => rel.updateEndPoints(true))

  relsArray.forEach(rel => rel.draw(ctx))
}

export function drawGuideline(ctx, guideline, width, height) {
  switch (guideline.type) {
    case 'HORIZONTAL':
      ctx.beginPath()
      ctx.moveTo(0, guideline.y)
      ctx.lineTo(width, guideline.y)
      ctx.stroke()
      ctx.closePath()
      break

    case 'VERTICAL':
      ctx.beginPath()
      ctx.moveTo(guideline.x, 0)
      ctx.lineTo(guideline.x, height)
      ctx.stroke()
      ctx.closePath()
      break

    case 'CIRCLE':
      ctx.beginPath()
      drawCircle(ctx, guideline.center, guideline.radius)
      ctx.stroke()
      ctx.closePath()
  }
}

function drawSolidCircle (ctx, position, color, size) {
  ctx.beginPath()

  ctx.fillStyle = color

  drawCircle(ctx, position, size)
  ctx.fill()
  ctx.closePath()
}

function drawCircle (ctx, position, r) {
  ctx.beginPath()
  ctx.arc(position.x, position.y, r, 0, 2 * Math.PI, false)
  ctx.closePath()
}
