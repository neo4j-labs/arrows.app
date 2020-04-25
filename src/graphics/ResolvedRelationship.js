export default class ResolvedRelationship {
  constructor(relationship, from, to, selected) {
    this.relationship = relationship
    this.id = relationship.id
    this.from = from
    this.to = to
    this.type = relationship.type
    this.selected = selected
  }
}