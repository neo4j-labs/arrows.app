
export type Id = string // TODO this should be a branded type

export interface Entity {
  id: Id
  entityType: string
  properties: Record<string, string>
  style: Record<string, string>,

}

export function asKey(id:Id) {
  return id
}

export function idsMatch(a:Id, b:Id) {
  return a === b
}

export function nextId(id:Id) {
  return 'n' + (parseInt(id.substring(1)) + 1)
}

export function nextAvailableId(entities:Pick<Entity, 'id'>[], prefix = 'n') {
  const currentIds = entities.map((entity) => entity.id)
    .filter((id) => new RegExp(`^${prefix}[0-9]+$`).test(id))
    .map((id) => parseInt(id.substring(1)))
    .sort((x, y) => x-y)

  return prefix + (currentIds.length > 0 ? currentIds.pop()! + 1 : 0)
}