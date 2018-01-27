import VisualNode from './VisualNode'
import VisualEdge from "./VisualEdge"
import VisualGraph from './VisualGraph'
import { getLines } from "./utils/wordwrap";
import get from 'lodash.get'

export function drawNode(ctx, position, color, size, caption, config) {
  drawSolidCircle(ctx, position, color, size)
  if (caption) {
    drawLabel(ctx, position, caption, size * 2, config)
  }
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

function drawLabel (ctx, position, label, maxWidth, config) {
  const fontSize = get(config, 'font.size')
  const fontColor = get(config, 'color.fill')
  const fontFace = get(config, 'font.face')

  let lines = getLines(ctx, label, fontFace, fontSize, maxWidth, false)//this.hasIcon)

  ctx.fillStyle = fontColor
  let fontWeight = 'normal' // this.boldText ? 'bold ' : 'normal '
  ctx.font = fontWeight + fontSize + 'px ' + fontFace

  const lineDistance = 1 + fontSize
  const totalHeight = (lines.length - 2) * lineDistance
  let ypos = -totalHeight / 2
  for (let line of lines) {
    let lineWidth = ctx.measureText(line).width
    let xpos = -lineWidth / 2
    ctx.fillText(line, position.x + xpos, position.y + ypos)
    ypos += lineDistance
  }
}