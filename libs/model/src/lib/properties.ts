import { isNode } from './Node';
import { nodeStyleAttributes, relationshipStyleAttributes } from './styling';
import { isRelationship } from './Relationship';
import { Entity } from './Id';
import { Graph } from './Graph';

export const combineProperties = (entities: Entity[]) => {
  const properties: Record<string, any> = {};
  let firstKey = true;
  entities.forEach((entity) => {
    if (entity.properties) {
      Object.keys(entity.properties).forEach((key) => {
        const currentEntry = properties[key];
        if (currentEntry) {
          if (
            currentEntry.status === 'CONSISTENT' &&
            currentEntry.value !== entity.properties[key]
          ) {
            properties[key] = { status: 'INCONSISTENT' };
          }
        } else {
          if (firstKey) {
            properties[key] = {
              status: 'CONSISTENT',
              value: entity.properties[key],
            };
          } else {
            properties[key] = { status: 'PARTIAL' };
          }
        }
      });
      Object.keys(properties).forEach((key) => {
        if (!Object.hasOwn(entity.properties, key)) {
          properties[key] = { status: 'PARTIAL' };
        }
      });
      firstKey = false;
    }
  });
  return properties;
};

export const summarizeProperties = (
  selectedEntities: Entity[],
  graph: Graph
) => {
  const keys: { key: string; nodeCount: number }[] = [],
    values = new Map<
      string,
      { value: string; inSelection: boolean; nodeCount: number }[]
    >();

  const keysInSelection = new Set<string>();
  selectedEntities.forEach((entity) => {
    Object.entries(entity.properties).forEach(([key, value]) => {
      keysInSelection.add(key);
      let valuesForKey = values.get(key);
      if (!valuesForKey) {
        values.set(key, (valuesForKey = []));
      }
      const existingValue = valuesForKey.find((entry) => entry.value === value);
      if (existingValue) {
        existingValue.nodeCount++;
      } else {
        valuesForKey.push({ value, inSelection: true, nodeCount: 1 });
      }
    });
  });

  graph.nodes.forEach((node) => {
    Object.entries(node.properties).forEach(([key, value]) => {
      if (key && !keysInSelection.has(key)) {
        const existingKey = keys.find((keyEntry) => keyEntry.key === key);
        if (existingKey) {
          existingKey.nodeCount++;
        } else {
          keys.push({ key, nodeCount: 1 });
        }
      }
      if (value) {
        let valuesForKey = values.get(key);
        if (!valuesForKey) {
          values.set(key, (valuesForKey = []));
        }
        const existingValue = valuesForKey.find(
          (entry) => entry.value === value
        );
        if (existingValue) {
          if (!existingValue.inSelection) {
            existingValue.nodeCount++;
          }
        } else {
          valuesForKey.push({ value, inSelection: false, nodeCount: 1 });
        }
      }
    });
  });
  return {
    keys,
    values,
  };
};

const doesStyleApply = (entity: Entity, styleKey: string) => {
  if (isNode(entity)) {
    return nodeStyleAttributes.includes(styleKey);
  } else if (isRelationship(entity)) {
    return relationshipStyleAttributes.includes(styleKey);
  } else {
    return false; // ABK reasonable default, right? not a node, nor a relationship, so style does not apply
  }
};

export const combineStyle = (entities: Entity[]) => {
  const style: Record<string, { status: string; value?: string }> = {};
  const firstKey = {
    node: true,
    relationship: true,
  };

  entities.forEach((entity) => {
    const entityType = isNode(entity) ? 'node' : 'relationship';
    if (entity.style) {
      Object.keys(entity.style).forEach((key) => {
        if (doesStyleApply(entity, key)) {
          const currentEntry = style[key];
          if (currentEntry) {
            if (
              currentEntry.status === 'CONSISTENT' &&
              currentEntry.value !== entity.style[key]
            ) {
              style[key] = { status: 'INCONSISTENT' };
            }
          } else {
            if (firstKey[entityType]) {
              style[key] = { status: 'CONSISTENT', value: entity.style[key] };
            } else {
              style[key] = { status: 'PARTIAL' };
            }
          }
        }
      });
    }

    Object.keys(style).forEach((key) => {
      if (doesStyleApply(entity, key) && !Object.hasOwn(entity.style, key)) {
        style[key] = { status: 'PARTIAL' };
      }
    });

    firstKey[entityType] = false;
  });

  return style;
};

export const propertyKeyToDatabaseKey = (propertyKey: string) => {
  return propertyKey === '' ? '_EMPTY_KEY' : propertyKey.replace(/_/g, '__');
};

const databaseKeyToPropertyKey = (databaseKey: string) => {
  return databaseKey === '_EMPTY_KEY' ? '' : databaseKey.replace(/__/g, '_');
};

export const styleKeyToDatabaseKey = (styleKey: string) => {
  return '_style-' + styleKey;
};

const databaseKeyToStyleyKey = (databaseKey: string) => {
  return databaseKey.replace(/^_style-/, '');
};

export const propertiesFromDatabaseEntity = (entity: Entity) => {
  return Object.keys(entity.properties).reduce((properties, propertyKey) => {
    if (!propertyKey.startsWith('_') || propertyKey.startsWith('__')) {
      properties[databaseKeyToPropertyKey(propertyKey)] =
        entity.properties[propertyKey];
    }
    return properties;
  }, {} as Record<string, string>);
};

export const styleFromDatabaseEntity = (entity: Entity) => {
  return Object.keys(entity.properties).reduce((style, propertyKey) => {
    if (propertyKey.startsWith('_style-')) {
      style[databaseKeyToStyleyKey(propertyKey)] =
        entity.properties[propertyKey];
    }
    return style;
  }, {} as Record<string, string>);
};

export const renameProperty = (
  entity: Entity,
  oldPropertyKey: string,
  newPropertyKey: string
) => {
  const properties: Record<string, string> = {};
  Object.keys(entity.properties).forEach((key) => {
    if (key === oldPropertyKey) {
      properties[newPropertyKey] = entity.properties[oldPropertyKey];
    } else {
      properties[key] = entity.properties[key];
    }
  });
  return {
    ...entity,
    properties,
  };
};

export const setProperty = (entity: Entity, key: string, value: string) => {
  const properties = { ...entity.properties };
  properties[key] = value;
  return {
    ...entity,
    properties,
  };
};

export const setArrowsProperty = (
  entity: Entity,
  key: string,
  value: string
) => {
  const newEntity = { ...entity };

  if (!newEntity.style) {
    newEntity.style = {};
  }

  newEntity.style[key] = value;
  Object.defineProperty(newEntity, key, {
    get: function () {
      return this.style[key];
    },
  });

  return newEntity;
};

export const removeProperty = (entity: Entity, keyToRemove: string) => {
  const properties: Record<string, string> = {};
  Object.keys(entity.properties).forEach((key) => {
    if (key !== keyToRemove) {
      properties[key] = entity.properties[key];
    }
  });
  return {
    ...entity,
    properties,
  };
};

export const removeArrowsProperty = (entity: Entity, keyToRemove: string) => {
  const style = { ...entity.style };
  delete style[keyToRemove];
  return {
    ...entity,
    style,
  };
};

export const indexablePropertyText = (entity: Entity) => {
  return Object.keys(entity.properties).map(
    (key) => `${key} ${entity.properties[key]}`
  );
};
