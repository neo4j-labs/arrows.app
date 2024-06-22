import { Graph, attachmentOptions } from '@neo4j-arrows/model';
import { getStyleSelector } from '@neo4j-arrows/model';
import { relationshipArrowDimensions } from './arrowDimensions';
import { ResolvedRelationship } from './ResolvedRelationship';
import { RectilinearArrow } from './RectilinearArrow';
import { compareWaypoints } from './SeekAndDestroy';
import { ElbowArrow } from './ElbowArrow';
import { VisualNode } from './VisualNode';
import { VisualAttachment } from './VisualAttachment';

export const computeRelationshipAttachments = (
  graph: Graph,
  visualNodes: Record<string, VisualNode>
) => {
  const nodeAttachments: Record<string, VisualAttachment> = {};
  const countAttachment = (
    nodeId: string,
    attachmentOptionName: keyof VisualAttachment
  ) => {
    const nodeCounters =
      nodeAttachments[nodeId] ||
      (nodeAttachments[nodeId] = {} as VisualAttachment);
    nodeCounters[attachmentOptionName] =
      (nodeCounters[attachmentOptionName] || 0) + 1;
  };

  graph.relationships.forEach((relationship) => {
    const style = (styleAttribute: string) =>
      getStyleSelector(relationship, styleAttribute)(graph);
    countAttachment(relationship.fromId, style('attachment-start'));
    countAttachment(relationship.toId, style('attachment-end'));
  });

  const centralAttachment = (
    nodeId: string,
    attachmentOptionName: keyof VisualAttachment
  ): VisualAttachment => {
    const total = nodeAttachments[nodeId][attachmentOptionName];
    return {
      attachment: findOption(attachmentOptionName),
      ordinal: (total - 1) / 2,
      radiusOrdinal: 0,
      minNormalDistance: 0,
      total,
    };
  };

  const routedRelationships = graph.relationships.map((relationship) => {
    const style = (styleAttribute: string) =>
      getStyleSelector(relationship, styleAttribute)(graph);
    const startAttachment = centralAttachment(
      relationship.fromId,
      style('attachment-start')
    );
    const endAttachment = centralAttachment(
      relationship.toId,
      style('attachment-end')
    );
    const resolvedRelationship = new ResolvedRelationship(
      relationship,
      visualNodes[relationship.fromId],
      visualNodes[relationship.toId],
      startAttachment,
      endAttachment,
      false,
      graph
    );
    let arrow;
    if (
      startAttachment.attachment.name !== 'normal' ||
      endAttachment.attachment.name !== 'normal'
    ) {
      if (
        startAttachment.attachment.name !== 'normal' &&
        endAttachment.attachment.name !== 'normal'
      ) {
        const dimensions = relationshipArrowDimensions(
          resolvedRelationship,
          graph,
          resolvedRelationship.from
        );
        arrow = new RectilinearArrow(
          resolvedRelationship.from.position,
          resolvedRelationship.to.position,
          dimensions.startRadius || 0,
          dimensions.endRadius || 0,
          resolvedRelationship.startAttachment,
          resolvedRelationship.endAttachment,
          dimensions
        );
      } else {
        const dimensions = relationshipArrowDimensions(
          resolvedRelationship,
          graph,
          resolvedRelationship.from
        );
        arrow = new ElbowArrow(
          resolvedRelationship.from.position,
          resolvedRelationship.to.position,
          dimensions.startRadius || 0,
          dimensions.endRadius || 0,
          resolvedRelationship.startAttachment,
          resolvedRelationship.endAttachment,
          dimensions
        );
      }
    }
    return { resolvedRelationship, arrow };
  });

  const relationshipAttachments = {
    start: {} as Record<string, VisualAttachment>,
    end: {} as Record<string, VisualAttachment>,
  };
  graph.nodes.forEach((node) => {
    const relationships = routedRelationships.filter(
      (routedRelationship) =>
        node.id === routedRelationship.resolvedRelationship.from.id ||
        node.id === routedRelationship.resolvedRelationship.to.id
    );
    attachmentOptions.forEach((option) => {
      const relevantRelationships = relationships.filter(
        (routedRelationship) => {
          const startAttachment =
            routedRelationship.resolvedRelationship.startAttachment;
          const endAttachment =
            routedRelationship.resolvedRelationship.endAttachment;
          return (
            (startAttachment.attachment === option &&
              node.id === routedRelationship.resolvedRelationship.from.id) ||
            (endAttachment.attachment === option &&
              node.id === routedRelationship.resolvedRelationship.to.id)
          );
        }
      );
      const neighbours = relevantRelationships.map((routedRelationship) => {
        const direction: 'start' | 'end' =
          routedRelationship.resolvedRelationship.from.id === node.id &&
          routedRelationship.resolvedRelationship.startAttachment.attachment ===
            option
            ? 'start'
            : 'end';
        let path,
          headSpace = 0;
        if (routedRelationship.arrow) {
          if (direction === 'end') {
            const dimensions = routedRelationship.arrow.dimensions;
            headSpace = dimensions.headHeight - dimensions.chinHeight;
          }
          if (
            routedRelationship.arrow.path &&
            routedRelationship.arrow.path.waypoints
          ) {
            if (direction === 'start') {
              path = routedRelationship.arrow.path;
            } else {
              path = routedRelationship.arrow.path.inverse();
            }
          }
        }

        return {
          relationship: routedRelationship.resolvedRelationship.relationship,
          direction,
          path,
          headSpace,
        };
      });
      const maxHeadSpace = Math.max(
        ...neighbours.map((neighbour) => neighbour.headSpace)
      );
      neighbours.sort((a, b) => {
        return a.path && b.path
          ? compareWaypoints(a.path.waypoints, b.path.waypoints)
          : 0;
      });
      neighbours.forEach((neighbour, i) => {
        relationshipAttachments[neighbour.direction][
          neighbour.relationship.id
        ] = {
          attachment: option,
          ordinal: i,
          radiusOrdinal: computeRadiusOrdinal(
            neighbour.path,
            i,
            neighbours.length
          ),
          minNormalDistance: maxHeadSpace,
          total: neighbours.length,
        };
      });
    });
  });

  return relationshipAttachments;
};

const findOption = (optionName: string) => {
  return (
    attachmentOptions.find((option) => option.name === optionName) || {
      name: 'normal',
      angle: 0,
    }
  ); // ABK: `angle: 0` is dubious, perhaps `angle` should be optional?
};

const computeRadiusOrdinal = (
  path: { polarity: number },
  ordinal: number,
  total: number
) => {
  if (path) {
    const polarity = path.polarity;

    switch (polarity) {
      case -1:
        return ordinal;

      case 1:
        return total - ordinal - 1;

      default:
        return Math.max(ordinal, total - ordinal - 1);
    }
  }
  return 0;
};
