import VisualNode from './VisualNode'
import VisualEdge from "./VisualEdge"
import VisualGraph from './VisualGraph'

export function drawNode(ctx, position, color, size) {
  drawSolidCircle(ctx, position, color, size)
}

export function drawRing(ctx, position, color, size) {
  drawSolidCircle(ctx, position, color, size)
}

export function drawRelationships(ctx, graph, relConfig, displayOptions) {
  const nodes = graph.nodes.reduce((nodes, node) => {
    nodes[node.id.value] = new VisualNode(node, displayOptions.viewTransformation)
    return nodes
  }, {})

  const relationships = graph.relationships.map(relationship =>
    new VisualEdge({
        relationship,
        from: nodes[relationship.fromId],
        to: nodes[relationship.toId]
      },
      relConfig)
  )

  const visualGraph = new VisualGraph(nodes, relationships)
  visualGraph.constructEdgeBundles()
  visualGraph.edges.forEach(edge => edge.draw(ctx))
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
