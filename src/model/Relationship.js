import uuid from "uuid/v4"
import {syntheticId} from "./Id";

export default class Relationship {
  constructor ({ id = syntheticId(uuid()), type, properties = {}}
  , fromId, toId) {
    this.id = id
    this.properties = properties
    this.type = type
    this.fromId = fromId
    this.toId = toId
  }
}