import { getNodeIdMap } from "../model/Graph";
import { blue } from "../model/colors";
import { drawTextLine } from "./canvasRenderer";
import { Vector } from "../model/Vector";

export default class NodeToolboxes {
  constructor(graph) {
    this.nodeIdMap = getNodeIdMap(graph)
    const superNodes = graph.nodes.filter(node => node.type === 'super')
    this.toolboxes = superNodes.map(sNode => {
      const subNodes = sNode.initialPositions.map(ip => this.nodeIdMap[ip.nodeId])
      return {
        node: sNode,
        subNodes
      }
    })
  }

  draw(ctx, { viewTransformation }) {
    return
    this.toolboxes.forEach(tb => {
      const radius = viewTransformation.scale * 50 // (50 + tb.subNodes.length * 10)
      const position = tb.node.position.translate(viewTransformation.offset).translate(new Vector(radius, -radius))
      ctx.save()
      ctx.font = {
        fontWeight: 'normal',
        fontSize: 16,
        fontFace: 'FontAwesome'
      }
      ctx.fillStyle = blue
      drawTextLine(ctx, '\uf0b2', position)
      ctx.restore()
    })
  }
}