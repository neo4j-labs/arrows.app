import {getStyleSelector} from "../selectors/style";
import {RelationshipCaption} from "./RelationshipCaption";
import {RelationshipProperties} from "./RelationshipProperties";

export class VisualRelationship {
  constructor(relationship, graph, arrow, editing, measureTextContext) {
    this.relationship = relationship
    this.arrow = arrow
    this.editing = editing

    const style = styleAttribute => getStyleSelector(relationship, styleAttribute)(graph)

    this.caption = new RelationshipCaption(
      relationship.type,
      arrow,
      editing,
      style,
      measureTextContext
    )
    this.properties = new RelationshipProperties(
      relationship.relationship.properties,
      arrow,
      editing,
      style,
      measureTextContext
    )
  }

  distanceFrom(point) {
    return Math.min(this.arrow.distanceFrom(point), this.caption.distanceFrom(point))
  }

  draw(ctx) {
    if (this.relationship.from.status === 'combined' && this.relationship.to.status === 'combined'
      && this.relationship.from.superNodeId === this.relationship.to.superNodeId) {
      return
    }

    if (this.relationship.selected) {
      this.arrow.drawSelectionIndicator(ctx)
      this.caption.drawSelectionIndicator(ctx)
    }
    this.arrow.draw(ctx)
    this.caption.draw(ctx)
    this.properties.draw(ctx)
  }
}