export default class ResolvedRelationship {
  constructor(relationship, from, to, startAttachment, endAttachment, selected) {
    this.relationship = relationship
    this.id = relationship.id
    this.from = from
    this.to = to
    this.startAttachment = startAttachment
    this.endAttachment = endAttachment
    this.type = relationship.type
    this.selected = selected
  }
}