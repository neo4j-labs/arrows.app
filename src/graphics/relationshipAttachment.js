import {attachmentOptions} from "../model/attachments";
import {getStyleSelector} from "../selectors/style";
import {relationshipArrowDimensions} from "./arrowDimensions";
import ResolvedRelationship from "./ResolvedRelationship";
import {RectilinearArrow} from "./RectilinearArrow";
import {compareWaypoints} from "./SeekAndDestroy";

export const computeRelationshipAttachments = (graph, visualNodes) => {
  const nodeAttachments = {}
  const countAttachment = (nodeId, attachmentOptionName) => {
    const nodeCounters = nodeAttachments[nodeId] || (nodeAttachments[nodeId] = {})
    nodeCounters[attachmentOptionName] = (nodeCounters[attachmentOptionName] || 0) + 1
  }

  graph.relationships.forEach(relationship => {
    const style = styleAttribute => getStyleSelector(relationship, styleAttribute)(graph)
    countAttachment(relationship.fromId, style('attachment-start'))
    countAttachment(relationship.toId, style('attachment-end'))
  })

  const centralAttachment = (nodeId, attachmentOptionName) => {
    const total = nodeAttachments[nodeId][attachmentOptionName]
    return {
      attachment: findOption(attachmentOptionName),
      ordinal: (total - 1) / 2,
      radiusOrdinal: 0,
      total
    }
  }

  const routedRelationships = graph.relationships.map(relationship => {
    const style = styleAttribute => getStyleSelector(relationship, styleAttribute)(graph)
    const startAttachment = centralAttachment(relationship.fromId, style('attachment-start'))
    const endAttachment = centralAttachment(relationship.toId, style('attachment-end'))
    const resolvedRelationship = new ResolvedRelationship(
      relationship,
      visualNodes[relationship.fromId],
      visualNodes[relationship.toId],
      startAttachment,
      endAttachment,
      false,
      graph)
    let arrow
    if (startAttachment.attachment.name !== 'normal' && endAttachment.attachment.name !== 'normal') {
      const dimensions = relationshipArrowDimensions(resolvedRelationship, graph, resolvedRelationship.from)
      arrow = new RectilinearArrow(
        resolvedRelationship.from.position,
        resolvedRelationship.to.position,
        dimensions.startRadius,
        dimensions.endRadius,
        resolvedRelationship.startAttachment,
        resolvedRelationship.endAttachment,
        dimensions
      )
    }
    return {resolvedRelationship, arrow}
  })

  const relationshipAttachments = {
    start: {},
    end: {}
  }
  graph.nodes.forEach(node => {
    const relationships = routedRelationships
      .filter(routedRelationship =>
        node.id === routedRelationship.resolvedRelationship.from.id ||
        node.id === routedRelationship.resolvedRelationship.to.id)
    attachmentOptions.forEach(option => {
      const relevantRelationships = relationships.filter(routedRelationship => {
        const startAttachment = routedRelationship.resolvedRelationship.startAttachment
        const endAttachment = routedRelationship.resolvedRelationship.endAttachment
        return (startAttachment.attachment === option && node.id === routedRelationship.resolvedRelationship.from.id) ||
          (endAttachment.attachment === option && node.id === routedRelationship.resolvedRelationship.to.id)
      })
      const neighbours = relevantRelationships.map(routedRelationship => {
        const direction = node.id === routedRelationship.resolvedRelationship.from.id ? 'start' : 'end'
        let path
        if (routedRelationship.arrow && routedRelationship.arrow.path && routedRelationship.arrow.path.waypoints) {
          if (direction === 'start') {
            path = routedRelationship.arrow.path
          } else {
            path = routedRelationship.arrow.path.inverse()
          }
        }

        return {
          relationship: routedRelationship.resolvedRelationship.relationship,
          direction,
          path
        }
      })
      neighbours.sort((a, b) => {
        return (a.path && b.path) ? compareWaypoints(a.path.waypoints, b.path.waypoints) : 0
      })
      neighbours.forEach((neighbour, i) => {
        relationshipAttachments[neighbour.direction][neighbour.relationship.id] = {
          attachment: option,
          ordinal: i,
          radiusOrdinal: computeRadiusOrdinal(neighbour.path, i, neighbours.length),
          total: neighbours.length
        }
      })
    })
  })

  return relationshipAttachments
}

const findOption = (optionName) => {
  return attachmentOptions.find(option => option.name === optionName) || { name: 'normal' }
}

const computeRadiusOrdinal = (path, ordinal, total) => {
  if (path) {
    const polarity = path.polarity

    switch (polarity) {
      case -1:
        return ordinal

      case 1:
        return total - ordinal - 1

      default:
        return Math.max(ordinal, total - ordinal - 1)
    }
  }
  return 0
}
