import {attachmentOptions, attachmentRelativePosition} from "../model/attachments";
import {getStyleSelector} from "../selectors/style";
import {otherNodeId} from "../model/Relationship";

export const computeRelationshipAttachments = (graph, visualNodes) => {
  const relationshipAttachments = {
    start: {},
    end: {}
  }
  graph.nodes.forEach(node => {
    const relationships = graph.relationships
      .filter(relationship => node.id === relationship.fromId || node.id === relationship.toId)
    attachmentOptions.forEach(option => {
      const relevantRelationships = relationships.filter(relationship => {
        const style = styleAttribute => getStyleSelector(relationship, styleAttribute)(graph)
        const startAttachment = style('attachment-start')
        const endAttachment = style('attachment-end')
        return (startAttachment === option.name && relationship.fromId === node.id) ||
          (endAttachment === option.name && relationship.toId === node.id)
      })
      const neighbours = relevantRelationships.map(relationship => {
        return {
          relationship,
          direction: relationship.fromId === node.id ? 'start' : 'end',
          neighbourPosition: attachmentRelativePosition(
            node.position,
            visualNodes[otherNodeId(relationship, node.id)].position,
            option
          )
        }
      })
      neighbours.sort((a, b) => a.neighbourPosition.y - b.neighbourPosition.y)
      neighbours.forEach((neighbour, i) => {
        relationshipAttachments[neighbour.direction][neighbour.relationship.id] = {
          attachment: option.name,
          ordinal: i,
          total: neighbours.length
        }
      })
    })
  })
  return relationshipAttachments
}