import {ParallelArrow} from "./ParallelArrow";
import {normalStraightArrow, StraightArrow} from "./StraightArrow";
import {VisualRelationship} from "./VisualRelationship";
import {relationshipEditing} from "../model/selection";
import {BalloonArrow} from "./BalloonArrow";
import {neighbourPositions} from "../model/Graph";
import {clockwiseAngularSpace} from "./utils/clockwiseAngularSpace";
import {normaliseAngle} from "./utils/angles";
import {ElbowArrow} from "./ElbowArrow";
import {RectilinearArrow} from "./RectilinearArrow";
import {relationshipArrowDimensions} from "./arrowDimensions";

export class RoutedRelationshipBundle {
  constructor(relationships, graph, selection, measureTextContext) {
    const arrows = []

    const leftNode = relationships[0].from
    const rightNode = relationships[0].to

    const arrowDimensions = relationships.map(relationship => relationshipArrowDimensions(relationship, graph, leftNode))

    const leftRadius = Math.max(...arrowDimensions.map(arrow => arrow.leftToRight ? arrow.startRadius : arrow.endRadius))
    const rightRadius = Math.max(...arrowDimensions.map(arrow => arrow.leftToRight ? arrow.endRadius : arrow.startRadius))
    const maxLeftHeadHeight = Math.max(...arrowDimensions.map(arrow => arrow.leftToRight ? 0 : arrow.headHeight))
    const maxRightHeadHeight = Math.max(...arrowDimensions.map(arrow => arrow.leftToRight ? arrow.headHeight : 0))
    const relationshipSeparation = Math.max(...arrowDimensions.map(arrow => arrow.separation))

    if (relationships[0].startAttachment || relationships[0].endAttachment) {
      if (relationships[0].startAttachment && relationships[0].endAttachment) {
        for (let i = 0; i < relationships.length; i++) {
          const dimensions = arrowDimensions[i]
          const relationship = relationships[i]

          arrows[i] = new RectilinearArrow(
            relationship.from.position,
            relationship.to.position,
            dimensions.startRadius,
            dimensions.endRadius,
            relationship.startAttachment,
            relationship.endAttachment,
            dimensions
          )
        }
      } else {
        for (let i = 0; i < relationships.length; i++) {
          const dimensions = arrowDimensions[i]
          const relationship = relationships[i]

          arrows[i] = new ElbowArrow(
            relationship.from.position,
            relationship.to.position,
            dimensions.startRadius,
            dimensions.endRadius,
            relationship.startAttachment,
            relationship.endAttachment,
            dimensions
          )
        }
      }
    } else if (leftNode === rightNode) {
      const selfNode = leftNode
      const neighbourAngles = neighbourPositions(selfNode, graph).map(position => position.vectorFrom(selfNode.position).angle())
      const biggestAngularSpace = clockwiseAngularSpace(neighbourAngles)
      const angularSeparation = biggestAngularSpace.gap / (relationships.length + 1)

      for (let i = 0; i < relationships.length; i++) {
        const dimensions = arrowDimensions[i]

        arrows[i] = new BalloonArrow(
          selfNode.position,
          dimensions.startRadius,
          normaliseAngle(biggestAngularSpace.start + (i + 1) * angularSeparation),
          relationshipSeparation,
          dimensions.startRadius * 4,
          40,
          dimensions
        )
      }
    } else {
      const firstDisplacement = -(relationships.length - 1) * relationshipSeparation / 2
      const middleRelationshipIndex = (relationships.length - 1) / 2;

      const maxDeflection = Math.PI / 2
      let leftTightening = 0.6
      if (relationshipSeparation * (relationships.length - 1) * leftTightening / leftRadius > maxDeflection) {
        leftTightening = maxDeflection * leftRadius / (relationshipSeparation * (relationships.length - 1))
      }
      if ((leftRadius + maxLeftHeadHeight) * Math.sin(leftTightening * -firstDisplacement / leftRadius) > -firstDisplacement) {
        leftTightening = Math.asin(firstDisplacement / (leftRadius + maxLeftHeadHeight)) * leftRadius / firstDisplacement
      }

      let rightTightening = 0.6
      if (relationshipSeparation * (relationships.length - 1) * rightTightening / rightRadius > maxDeflection) {
        rightTightening = maxDeflection * rightRadius / (relationshipSeparation * (relationships.length - 1))
      }
      if ((rightRadius + maxRightHeadHeight) * Math.sin(rightTightening * -firstDisplacement / rightRadius) > -firstDisplacement) {
        rightTightening = Math.asin(firstDisplacement / (rightRadius + maxRightHeadHeight)) * rightRadius / firstDisplacement
      }

      let possibleToDrawParallelArrows = true

      for (let i = 0; i < relationships.length; i++) {
        const relationship = relationships[i]
        const dimensions = arrowDimensions[i]

        if (i === middleRelationshipIndex) {
          arrows[i] = new normalStraightArrow(
            relationship.from.position,
            relationship.to.position,
            dimensions.startRadius,
            dimensions.endRadius,
            dimensions
          )
        } else {
          const displacement = (firstDisplacement + i * relationshipSeparation) * (dimensions.leftToRight ? 1 : -1)
          const arrow = new ParallelArrow(
            relationship.from.position,
            relationship.to.position,
            dimensions.startRadius,
            dimensions.endRadius,
            displacement * (dimensions.leftToRight ? leftTightening / leftRadius : rightTightening / rightRadius),
            displacement * (dimensions.leftToRight ? rightTightening / rightRadius : leftTightening / leftRadius),
            displacement,
            40,
            dimensions
          )
          possibleToDrawParallelArrows &= arrow.drawArcs
          arrows[i] = arrow
        }
      }

      if (!possibleToDrawParallelArrows) {
        for (let i = 0; i < arrows.length; i++) {
          if (i !== middleRelationshipIndex) {
            const parallelArrow = arrows[i]
            arrows[i] = new StraightArrow(
              parallelArrow.startCentre,
              parallelArrow.endCentre,
              parallelArrow.startAttach,
              parallelArrow.endAttach,
              arrowDimensions[i]
            )
          }
        }
      }
    }

    this.routedRelationships = []
    for (let i = 0; i < relationships.length; i++) {
      const relationship = relationships[i]

      this.routedRelationships.push(new VisualRelationship(
        relationship, graph, arrows[i], relationshipEditing(selection, relationship.id), measureTextContext
      ))
    }
  }

  draw(ctx) {
    this.routedRelationships.forEach(routedRelationship => {
      routedRelationship.draw(ctx)
    })
  }
}
