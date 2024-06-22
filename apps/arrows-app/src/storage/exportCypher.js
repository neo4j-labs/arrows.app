import { styleKeyToDatabaseKey } from '../model/properties';
import { getNodeIdMap } from '../model/Graph';
const plainIdentifier = new RegExp('^[A-Za-z][A-Za-z_]*$');

const escape = (name) => {
  if (plainIdentifier.test(name)) {
    return name;
  } else {
    return '`' + name + '`';
  }
};

const quote = (value) => {
  if (
    typeof value === 'number' ||
    (!isNaN(value) && !isNaN(parseFloat(value)))
  ) {
    return value;
  } else {
    return '"' + value + '"';
  }
};

const space = (left, right) => {
  return [left, right].filter((part) => part).join(' ');
};

const entityProperties = (entity, includeStyling) => {
  const propertyEntries = Object.entries(entity.properties).map(
    ([key, value]) => `${escape(key)}: ${quote(value)}`
  );
  const styleEntries = Object.entries(entity.style).map(
    ([key, value]) => `${escape(styleKeyToDatabaseKey(key))}: ${quote(value)}`
  );

  const entries = includeStyling
    ? propertyEntries.concat(styleEntries)
    : propertyEntries;
  if (entries.length > 0) {
    return '{' + entries.join(', ') + '}';
  } else {
    return null;
  }
};

export const exportCypher = (graph, keyword, options) => {
  const captionMap = {};
  graph.nodes.forEach((node) => {
    if (node.caption) {
      if (captionMap[node.caption]) {
        captionMap[node.caption].push(node);
      } else {
        captionMap[node.caption] = [node];
      }
    }
  });
  const idMap = {};
  graph.nodes.forEach((node) => {
    if (node.caption && captionMap[node.caption].length === 1) {
      idMap[node.id] = escape(node.caption);
    } else {
      idMap[node.id] = node.id;
    }
  });
  const nodeIdMap = getNodeIdMap(graph);
  const paths = [];
  graph.relationships.forEach((relationship) => {
    let matchesStart = (node) => relationship.fromId === node.id;
    let matchesEnd = (node) => relationship.toId === node.id;
    const matches = (node) => matchesStart(node) || matchesEnd(node);
    const growablePath = paths.find(
      (path) => matches(path[0]) || matches(path[path.length - 1])
    );
    if (growablePath) {
      if (matches(growablePath[growablePath.length - 1])) {
        const anchorNode = growablePath[growablePath.length - 1];
        const [otherNode, direction] = matchesStart(anchorNode)
          ? [nodeIdMap[relationship.toId], 'forward']
          : [nodeIdMap[relationship.fromId], 'reverse'];
        growablePath.push({ relationship, direction });
        growablePath.push(otherNode);
      } else {
        const anchorNode = growablePath[0];
        const [otherNode, direction] = matchesEnd(anchorNode)
          ? [nodeIdMap[relationship.fromId], 'forward']
          : [nodeIdMap[relationship.toId], 'reverse'];
        growablePath.unshift({ relationship, direction });
        growablePath.unshift(otherNode);
      }
    } else {
      paths.push([
        nodeIdMap[relationship.fromId],
        { relationship, direction: 'forward' },
        nodeIdMap[relationship.toId],
      ]);
    }
  });
  const nodeCounts = paths.reduce((nodeCounts, path) => {
    for (let i = 0; i < path.length; i++) {
      if (i % 2 === 0) {
        const node = path[i];
        if (nodeCounts.hasOwnProperty(node.id)) {
          nodeCounts[node.id] = nodeCounts[node.id] + 1;
        } else {
          nodeCounts[node.id] = 1;
        }
      }
    }
    return nodeCounts;
  }, {});
  graph.nodes.forEach((node) => {
    if (!nodeCounts.hasOwnProperty(node.id)) {
      paths.push([node]);
      nodeCounts[node.id] = 1;
    }
  });
  Object.entries(nodeCounts).forEach(([nodeId, count]) => {
    if (count === 1) {
      idMap[nodeId] = '';
    }
  });

  const visitedNodes = {};

  const prefix = keyword === 'MERGE' ? '' : keyword + ' ';
  const pathPrefix = keyword === 'MERGE' ? 'MERGE ' : '';
  const pathSeparator = keyword === 'MERGE' ? '\n' : ',\n';
  const suffix =
    keyword === 'MATCH'
      ? '\nRETURN ' +
        paths.map((path, pathIndex) => 'path' + pathIndex).join(', ')
      : '';

  return (
    prefix +
    paths
      .map((path, pathIndex) => {
        let line = pathPrefix;
        if (keyword === 'MATCH') {
          line += `path${pathIndex} = `;
        }
        for (let i = 0; i < path.length; i++) {
          const part = path[i];
          if (i % 2 === 0) {
            const node = part;
            const labels = node.labels
              .map((label) => `:${escape(label)}`)
              .join('');
            const properties = entityProperties(node, options.includeStyling);
            if (visitedNodes[node.id]) {
              line += `(${idMap[node.id]})`;
            } else {
              line += `(${space(idMap[node.id] + labels, properties)})`;
              visitedNodes[node.id] = true;
            }
          } else {
            const relationship = part.relationship;
            let type = relationship.type || '_RELATED';
            if (type === '_RELATED' && keyword === 'MATCH') {
              type = null;
            }
            const properties = entityProperties(
              relationship,
              options.includeStyling
            );
            const relationshipSpec =
              type || properties
                ? `[${space(type ? ':' + type : null, properties)}]`
                : '';
            const firstArrow = part.direction === 'reverse' ? '<-' : '-';
            const secondArrow = part.direction === 'forward' ? '->' : '-';
            line += firstArrow + relationshipSpec + secondArrow;
          }
        }
        return line;
      })
      .join(pathSeparator) +
    suffix
  );
};
