import {getStyleSelector} from "../selectors/style";
import {RelationshipCaption} from "./RelationshipCaption";
import {RelationshipProperties} from "./RelationshipProperties";

export class VisualRelationship {
  constructor(resolvedRelationship, graph, arrow, editing, measureTextContext) {
    this.resolvedRelationship = resolvedRelationship
    this.arrow = arrow
    this.editing = editing

    const style = styleAttribute => getStyleSelector(resolvedRelationship.relationship, styleAttribute)(graph)

    this.caption = new RelationshipCaption(
      resolvedRelationship.type,
      arrow,
      editing,
      style,
      measureTextContext
    )
    this.properties = new RelationshipProperties(
      resolvedRelationship.relationship.properties,
      arrow,
      editing,
      style,
      measureTextContext
    )
  }

  get id() {
    return this.resolvedRelationship.id
  }

  distanceFrom(point) {
    return Math.min(this.arrow.distanceFrom(point), this.caption.distanceFrom(point))
  }

  draw(ctx) {
    if (this.resolvedRelationship.from.status === 'combined' && this.resolvedRelationship.to.status === 'combined'
      && this.resolvedRelationship.from.superNodeId === this.resolvedRelationship.to.superNodeId) {
      return
    }

    if (this.resolvedRelationship.selected) {
      this.arrow.drawSelectionIndicator(ctx)
      this.caption.drawSelectionIndicator(ctx)
    }
    this.arrow.draw(ctx)
    this.caption.draw(ctx)
    this.properties.draw(ctx)
  }
}