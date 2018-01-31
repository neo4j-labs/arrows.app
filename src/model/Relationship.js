import uuid from "uuid/v4"

export default class Relationship {
  constructor ({ id = {
    type: 'SYNTHETIC',
    value: uuid()
  }, type, properties = {}}
  , fromId, toId) {
    this.id = id
    this.properties = properties
    this.type = type
    this.fromId = fromId
    this.toId = toId
  }
}