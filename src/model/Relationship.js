export const setType = (relationship, type) => {
  return {
    id: relationship.id,
    type,
    properties: relationship.properties,
    fromId: relationship.fromId,
    toId: relationship.toId
  }
}