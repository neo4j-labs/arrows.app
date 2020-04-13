import {getStyleSelector} from "../selectors/style";
import {StraightArrow} from "./StraightArrow";
import {ParallelArrow} from "./ParallelArrow";
import {SlantedArrow} from "./SlantedArrow";
import {RelationshipCaption} from "./RelationshipCaption";

export class RoutedRelationshipBundle {
  constructor(relationships, graph) {
    this.routedRelationships = []

    const leftNode = relationships[0].from

    const arrowDimensions = relationships.map(relationship => {
      const style = styleKey => getStyleSelector(relationship.relationship, styleKey)(graph)
      const startRadius = relationship.from.radius + style('margin-start')
      const endRadius = relationship.to.radius + style('margin-end')
      const arrowWidth = style('arrow-width')
      const arrowColor = style('arrow-color')
      const headWidth = arrowWidth + 6 * Math.sqrt(arrowWidth)
      const headHeight = headWidth * 1.5
      const chinHeight = headHeight / 10
      const separation = style('margin-peer')
      const leftToRight = relationship.from === leftNode
      return { startRadius, endRadius, arrowWidth, arrowColor, headWidth, headHeight, chinHeight, separation, leftToRight }
    })

    const leftRadius = Math.max(...arrowDimensions.map(arrow => arrow.leftToRight ? arrow.startRadius : arrow.endRadius))
    const rightRadius = Math.max(...arrowDimensions.map(arrow => arrow.leftToRight ? arrow.endRadius : arrow.startRadius))
    const maxLeftHeadHeight = Math.max(...arrowDimensions.map(arrow => arrow.leftToRight ? 0 : arrow.headHeight))
    const maxRightHeadHeight = Math.max(...arrowDimensions.map(arrow => arrow.leftToRight ? arrow.headHeight : 0))
    const relationshipSeparation = Math.max(...arrowDimensions.map(arrow => arrow.separation))

    const firstDisplacement = -(relationships.length - 1) * relationshipSeparation / 2
    const middleRelationshipIndex = (relationships.length - 1) / 2;

    const maxDeflection = Math.PI / 2
    let leftTightening = 0.8
    if (relationshipSeparation * (relationships.length - 1) * leftTightening / leftRadius > maxDeflection) {
      leftTightening = maxDeflection * leftRadius / (relationshipSeparation * (relationships.length - 1))
    }
    if ((leftRadius + maxLeftHeadHeight) * Math.sin(leftTightening * -firstDisplacement / leftRadius) > -firstDisplacement) {
      leftTightening = Math.asin(firstDisplacement / (leftRadius + maxLeftHeadHeight)) * leftRadius / firstDisplacement
    }

    let rightTightening = 0.8
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

      const caption = (relationship.type && relationship.type.length > 0) ?
        new RelationshipCaption(relationship.type, styleKey => getStyleSelector(relationship.relationship, styleKey)(graph)) : null

      if (i === middleRelationshipIndex) {
        this.routedRelationships.push(new RoutedRelationship(
          relationship,
          new StraightArrow(
            relationship.from.position,
            relationship.to.position,
            dimensions.startRadius,
            dimensions.endRadius,
            dimensions.arrowWidth,
            dimensions.headWidth,
            dimensions.headHeight,
            dimensions.chinHeight,
            dimensions.arrowColor
          ),
          caption
        ))
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
          30,
          dimensions.arrowWidth,
          dimensions.headWidth,
          dimensions.headHeight,
          dimensions.chinHeight,
          dimensions.arrowColor
        )
        possibleToDrawParallelArrows &= arrow.drawArcs
        this.routedRelationships.push(new RoutedRelationship(
          relationship,
          arrow,
          caption
        ))
      }
    }

    if (!possibleToDrawParallelArrows) {
      for (let i = 0; i < this.routedRelationships.length; i++) {
        const routedRelationship = this.routedRelationships[i]
        if (i !== middleRelationshipIndex) {
          const parallelArrow = routedRelationship.arrow
          routedRelationship.arrow = new SlantedArrow(
            parallelArrow.startCentre,
            parallelArrow.endCentre,
            parallelArrow.startAttach,
            parallelArrow.endAttach,
            parallelArrow.arrowWidth,
            parallelArrow.headWidth,
            parallelArrow.headHeight,
            parallelArrow.chinHeight,
            parallelArrow.arrowColor
          )
        }
      }
    }
  }

  draw(ctx) {
    this.routedRelationships.forEach(routedRelationship => {
      routedRelationship.draw(ctx)
    })
  }
}

class RoutedRelationship {
  constructor(relationship, arrow, caption) {
    this.relationship = relationship
    this.arrow = arrow
    this.caption = caption
  }

  distanceFrom(point) {
    return this.arrow.distanceFrom(point)
  }

  draw(ctx) {
    if (this.relationship.from.status === 'combined' && this.relationship.to.status === 'combined'
      && this.relationship.from.superNodeId === this.relationship.to.superNodeId) {
      return
    }

    if (this.relationship.selected) {
      this.arrow.drawSelectionIndicator(ctx)
    }
    this.arrow.draw(ctx)
    if (this.caption) {
      this.caption.draw(this.arrow, ctx)
    }
  }
}