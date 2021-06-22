import { print } from "graphql";
import extractNameFromTypeNode from "./extractNameFromTypeNode";
import typeStringToTypeNode from "./typeStringToTypeNode";

function appendRelationField({ rel, toNode, definition, direction }) {
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

  /**
   * @type {import("graphql").FieldDefinitionNode}
   */
  const field = {
    kind: "FieldDefinition",
    name: { kind: "Name", value: relTypeName.toLowerCase() },
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

  field.directives.push(relationshipDirective);
  definition.fields.push(field);
}

function exportGraphQL(graph) {
  /**
   * @type {import("graphql").DocumentNode}
   */
  let graphQLAST = {
    kind: "Document",
    definitions: [],
  };

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
      properties: n.properties,
      relationships: [],
    };
  });

  graph.relationships.forEach((rel) => {
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

    const from = nodes.find((n) => n.graphID === rel.fromId);
    from.relationships.push({
      type: rel.type,
      toGraphID: rel.toId,
    });
  });

  graphQLAST.definitions = nodes.map((node) => {
    /**
     * @type {import("graphql").DefinitionNode}
     */
    const def = {
      kind: "ObjectTypeDefinition",
      name: {
        kind: "Name",
        value: node.label,
      },
      fields: [],
    };

    Object.entries({
      ...node.properties,
      __internalID__: node.graphID,
    }).forEach(([key, value]) => {
      /**
       * @type {import("graphql").FieldDefinitionNode}
       */
      const field = {
        kind: "FieldDefinition",
        name: { kind: "Name", value: key },
        type: typeStringToTypeNode(value),
      };

      def.fields.push(field);
    });

    return def;
  });

  // Second iteration as definitions are now created
  // Here we can add relationship fields to definitions going either way
  nodes.forEach((node) => {
    const definition = graphQLAST.definitions.find((def) =>
      def.fields.find((field) => {
        return (
          field.name.value === "__internalID__" &&
          field.type.name.value === node.graphID
        );
      })
    );

    node.relationships.forEach((rel) => {
      const toNode = nodes.find((n) => n.graphID === rel.toGraphID);
      const toDefinition = graphQLAST.definitions.find((def) =>
        def.fields.find((field) => {
          return (
            field.name.value === "__internalID__" &&
            field.type.name.value === rel.toGraphID
          );
        })
      );

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

  // Delete internal ids once applied relationships.
  graphQLAST.definitions.forEach((definition) => {
    definition.fields = definition.fields.filter(
      (field) => !Boolean(field.name.value === "__internalID__")
    );
  });

  return print(graphQLAST);
}

export default exportGraphQL;
