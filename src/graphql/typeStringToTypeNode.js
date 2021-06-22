function typeStringToTypeNode(typeString) {
  /**
   * @type {import("graphql").TypeNode}
   */
  let typeNode = {
    kind: "NamedType",
    name: { kind: "Name", value: typeString },
  };

  const splitted = typeString.split("");
  const first = splitted[0];
  const last = splitted[splitted.length - 1];

  if (first === "[" && last === "]") {
    splitted.shift();
    splitted.pop();

    typeNode = {
      kind: "ListType",
      type: {
        kind: "NamedType",
        name: {
          kind: "Name",
          value: splitted.join(""),
        },
      },
    };
  }

  if (last === "!") {
    const secondLast = splitted[splitted.length - 2];
    splitted.pop();

    if (first === "[" && secondLast === "]") {
      splitted.shift();
      splitted.pop();

      typeNode = {
        kind: "NonNullType",
        type: {
          kind: "ListType",
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: splitted.join("") },
          },
        },
      };
    } else {
      typeNode = {
        kind: "NonNullType",
        type: {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: splitted.join(""),
          },
        },
      };
    }
  }

  return typeNode;
}

export default typeStringToTypeNode;
