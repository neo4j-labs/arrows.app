import { print } from "graphql";
import extractNameFromTypeNode from "./extractNameFromTypeNode";
import makeStringUnique from "./makeStringUnique";
import snakeToCamelCase from "./snakeToCamelCase";
import snakeToPascalCase from "./snakeToPascalCase";
import typeStringToTypeNode from "./typeStringToTypeNode";

function inferTypeFromValue(value) {
  if (value === null || value === undefined) {
    return 'String'; // Default to String for null/undefined
  }
  
  const graphQLTypes = ["String", "Int", "Float", "Boolean", "ID"];
  const extendedGraphQLTypes = ["DateTime", "Date", "Time", "URL", "Email", "JSON", "BigInt"];
  
  const allTypes = [...graphQLTypes, ...extendedGraphQLTypes];
  
  // Check if value is a GraphQL type (standard or extended)
  if (allTypes.includes(value)) {
    return value;
  }
  
  for (const type of allTypes) {
    if (value === `${type}!`) {
      return value;
    }
    
    if (value === `[${type}]`) {
      return value;
    }
    
    if (value === `[${type}]!`) {
      return value;
    }
    
    if (value === `[${type}!]`) {
      return value;
    }
    
    if (value === `[${type}!]!`) {
      return value;
    }
  }
  
  if (/^-?\d+$/.test(value)) {
    return 'Int';
  }

  if (/^-?\d+\.\d+$/.test(value)) {
    return 'Float';
  }
  
  if (value === 'true' || value === 'false') {
    return 'Boolean';
  }
  
  return 'String';
}

function appendRelationField({ rel, toNode, definition, direction }) {
  if (!rel || !toNode || !definition || !direction) {
    return;
  }

  const relTypeNode = typeStringToTypeNode(rel.type);
  const relTypeName = extractNameFromTypeNode(relTypeNode);

  if (relTypeNode.kind === "ListType") {
    if (relTypeNode.type.kind === "NonNullType") {
      relTypeNode.type.type.name.value = toNode.label;
    } else {
      relTypeNode.type.name.value = toNode.label;
    }
  } else if (relTypeNode.kind === "NonNullType") {
    if (relTypeNode.type.kind === "ListType") {
      relTypeNode.type.type.name.value = toNode.label;
    } else {
      relTypeNode.type.name.value = toNode.label;
    }
  } else {
    relTypeNode.name.value = toNode.label;
  }

  let relFieldName = snakeToCamelCase(relTypeName + "_" + toNode.label);
  if (direction === "IN") {
    relFieldName = snakeToCamelCase(toNode.label + "_" + relTypeName);
  }

  /**
   * @type {import("graphql").FieldDefinitionNode}
   */
  const field = {
    kind: "FieldDefinition",
    name: { kind: "Name", value: relFieldName },
    type: relTypeNode,
    directives: [],
  };

  /**
   * @type {import("graphql").DirectiveNode}
   */
  const relationshipDirective = {
    kind: "Directive",
    name: { kind: "Name", value: "relationship" },
    arguments: [
      {
        kind: "Argument",
        name: { kind: "Name", value: "type" },
        value: {
          kind: "StringValue",
          value: relTypeName,
        },
      },
      {
        kind: "Argument",
        name: { kind: "Name", value: "direction" },
        value: { kind: "EnumValue", value: direction },
      },
    ],
  };
  
  if (rel.propertiesReference) {
    relationshipDirective.arguments.push({
      kind: "Argument",
      name: { kind: "Name", value: "properties" },
      value: { kind: "StringValue", value: rel.propertiesReference },
    });
  }

  field.directives.push(relationshipDirective);
  
  if (!definition.fields) {
    definition.fields = [];
  }
  
  definition.fields.push(field);
}

function exportGraphQL(graph) {
  if (!graph.nodes || graph.nodes.length === 0) {
    throw new Error("GraphQL export requires at least one node.");
  }
  
  /**
   * @type {import("graphql").DocumentNode}
   */
  let graphQLAST = {
    kind: "Document",
    definitions: [],
  };

  const interfaces = [];
  const nodes = graph.nodes.map((n) => {
    const label = (n.labels || [])[0];
    if (!label) {
      throw new Error("Nodes require a single label for GraphQL export.");
    }

    if (!Object.keys(n.properties || {}).length) {
      throw new Error(
        "Nodes require at least one property for GraphQL export."
      );
    }

    return {
      label,
      graphID: n.id,
      properties: n.properties || {},
      relationships: [],
    };
  });

  if (graph.relationships && graph.relationships.length > 0) {
    graph.relationships.forEach((rel) => {
      if (!rel.fromId || !rel.toId) {
        return;
      }
      
      if (rel.style && rel.style.directionality === "undirected") {
        throw new Error(
          "Undirected relationships not supported with GraphQL export."
        );
      }

      if (!rel.type) {
        throw new Error(
          "Relationships without a type are not supported with GraphQL export."
        );
      }

      const from = nodes.find(n => n.graphID === rel.fromId);
      const to = nodes.find(n => n.graphID === rel.toId);
      
      if (!from || !to) {
        return;
      }

      let propertiesReferenceName;
      const properties = rel.properties || {};
      const hasProperties = Object.keys(properties).length > 0;

      // Generate rel property interface name
      if (hasProperties) {
        propertiesReferenceName = makeStringUnique(
          interfaces.map((i) => i.name),
          snakeToPascalCase(
            extractNameFromTypeNode(typeStringToTypeNode(rel.type))
          )
        );
      }

      from.relationships.push({
        type: rel.type,
        toGraphID: rel.toId,
        propertiesReference: propertiesReferenceName,
      });

      if (hasProperties) {
        interfaces.push({
          name: propertiesReferenceName,
          properties: properties,
        });
      }
    });
  }

  graphQLAST.definitions = nodes
    .map((node) => {
      /**
       * @type {import("graphql").DefinitionNode}
       */
      const definition = {
        kind: "ObjectTypeDefinition",
        name: {
          kind: "Name",
          value: node.label,
        },
        fields: Object.entries({
          ...node.properties,
          __internalID__: node.graphID,
        }).map(([key, value]) => ({
          kind: "FieldDefinition",
          name: { kind: "Name", value: key },
          type: typeStringToTypeNode(inferTypeFromValue(value)),
        })),
      };

      return definition;
    })
    .concat(
      interfaces.map((iFace) => {
        const definition = {
          kind: "InterfaceTypeDefinition",
          name: {
            kind: "Name",
            value: iFace.name,
          },
          fields: Object.entries({
            ...iFace.properties,
          }).map(([key, value]) => ({
            kind: "FieldDefinition",
            name: { kind: "Name", value: key },
            type: typeStringToTypeNode(inferTypeFromValue(value)),
          })),
        };
        return definition;
      })
    );

  const definitionsByLabel = new Map();
  graphQLAST.definitions.forEach(def => {
    if (def.kind === "ObjectTypeDefinition") {
      definitionsByLabel.set(def.name.value, def);
    }
  });

  nodes.forEach((node) => {
    if (!node.relationships || node.relationships.length === 0) {
      return;
    }

    const definition = definitionsByLabel.get(node.label);
    if (!definition) {
      return;
    }

    node.relationships.forEach((rel) => {
      const toNode = nodes.find(n => n.graphID === rel.toGraphID);
      if (!toNode) {
        return;
      }
      
      const toDefinition = definitionsByLabel.get(toNode.label);
      if (!toDefinition) {
        return;
      }

      appendRelationField({
        rel,
        toNode,
        definition,
        direction: "OUT",
      });

      appendRelationField({
        rel,
        toNode: node,
        definition: toDefinition,
        direction: "IN",
      });
    });
  });

  // Delete internal ids once applied relationships
  graphQLAST.definitions.forEach((definition) => {
    if (definition.fields) {
      definition.fields = definition.fields.filter(
        (field) => field.name.value !== "__internalID__"
      );
    }
  });

  return print(graphQLAST);
}

// Export the inferTypeFromValue function for testing
export { inferTypeFromValue };
export default exportGraphQL;