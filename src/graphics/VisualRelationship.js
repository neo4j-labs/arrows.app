export class VisualRelationship {
  constructor(relationship, arrow, caption) {
    this.relationship = relationship
    this.arrow = arrow
    this.caption = caption
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
  }
}