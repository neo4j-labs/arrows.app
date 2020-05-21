import {attachmentOptions} from "../model/attachments";
import {getStyleSelector} from "../selectors/style";
import {otherNodeId} from "../model/Relationship";
import {relationshipArrowDimensions} from "./arrowDimensions";
import ResolvedRelationship from "./ResolvedRelationship";
import {ElbowArrow} from "./ElbowArrow";
import {RectilinearArrow} from "./RectilinearArrow";
import {compareWaypoints} from "./SeekAndDestroy";

export const computeRelationshipAttachments = (graph, visualNodes) => {
  const relationshipAttachments = {
    start: {},
    end: {}
  }
  graph.nodes.forEach(node => {
    const visualNode = visualNodes[node.id]
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
        const otherVisualNode = visualNodes[otherNodeId(relationship, node.id)]
        const direction = relationship.fromId === node.id ? 'start' : 'end';
        const style = styleAttribute => getStyleSelector(relationship, styleAttribute)(graph)
        const otherAttachmentOption = findOption(direction === 'start' ?
          style('attachment-end') : style('attachment-start'))
        const resolvedRelationship = new ResolvedRelationship(
          relationship,
          direction === 'start' ? visualNode : otherVisualNode,
          direction === 'end' ? visualNode : otherVisualNode,
          direction === 'start' ? dummyAttachment(option) : dummyAttachment(otherAttachmentOption),
          direction === 'end' ? dummyAttachment(option) : dummyAttachment(otherAttachmentOption),
          false
        );
        const dimensions = relationshipArrowDimensions(resolvedRelationship, graph, node)
        const arrow = otherAttachmentOption.name === 'normal' ? new ElbowArrow(
          resolvedRelationship.from.position,
          resolvedRelationship.to.position,
          dimensions.startRadius,
          dimensions.endRadius,
          resolvedRelationship.startAttachment,
          resolvedRelationship.endAttachment,
          dimensions
        ) : new RectilinearArrow(
          resolvedRelationship.from.position,
          resolvedRelationship.to.position,
          dimensions.startRadius,
          dimensions.endRadius,
          resolvedRelationship.startAttachment,
          resolvedRelationship.endAttachment,
          dimensions
        )

        return {
          relationship,
          direction,
          arrow
        }
      })
      neighbours.sort((a, b) => {
        return (a.arrow.path && b.arrow.path) ? compareWaypoints(a.arrow.path.waypoints, b.arrow.path.waypoints) : 0
      })
      neighbours.forEach((neighbour, i) => {
        relationshipAttachments[neighbour.direction][neighbour.relationship.id] = {
          attachment: option,
          ordinal: i,
          total: neighbours.length
        }
      })
    })
  })
  return relationshipAttachments
}

const findOption = (optionName) => {
  return attachmentOptions.find(option => option.name = optionName)
}

const dummyAttachment = (option) => {
  return {
    attachment: option,
    ordinal: 0,
    total: 1
  }
}