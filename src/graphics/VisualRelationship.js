export class VisualRelationship {
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