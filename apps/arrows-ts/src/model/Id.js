export function asKey(id) {
  return id;
}

export function idsMatch(a, b) {
  return a === b;
}

export function nextId(id) {
  return 'n' + (parseInt(id.substring(1)) + 1);
}

export function nextAvailableId(entities, prefix = 'n') {
  const currentIds = entities
    .map((entity) => entity.id)
    .filter((id) => new RegExp(`^${prefix}[0-9]+$`).test(id))
    .map((id) => parseInt(id.substring(1)))
    .sort((x, y) => x - y);

  return prefix + (currentIds.length > 0 ? currentIds.pop() + 1 : 0);
}
