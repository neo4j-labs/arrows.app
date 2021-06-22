import exportGraphQL from "./exportGraphQL";
import { parse, print } from "graphql";

function compare(expected, received) {
  expect(print(parse(received, { noLocation: true }))).toEqual(
    print(parse(expected, { noLocation: true }))
  );
}

describe("graphql", () => {
  describe("exportGraphQL", () => {
    it("should throw Nodes requires a single label", () => {
      const graph = {
        nodes: [
          {
            id: "n0",
            caption: "",
            labels: [""],
            properties: {
              name: "String",
            },
            style: {},
          },
        ],
        relationships: [],
      };

      try {
        exportGraphQL(graph);
        throw new Error("asserting this test throws");
      } catch (error) {
        expect(error.message).toEqual(
          "Nodes require a single label for GraphQL export."
        );
      }
    });

    it("should throw Nodes require at least one property", () => {
      const graph = {
        nodes: [
          {
            id: "n0",
            caption: "",
            labels: ["Movie"],
            properties: {},
            style: {},
          },
        ],
        relationships: [],
      };

      try {
        exportGraphQL(graph);
        throw new Error("asserting this test throws");
      } catch (error) {
        expect(error.message).toEqual(
          "Nodes require at least one property for GraphQL export."
        );
      }
    });

    it("should throw undirected relationships not supported", () => {
      const graph = {
        nodes: [
          {
            id: "n0",
            caption: "",
            labels: ["Actor"],
            properties: {
              name: "String",
            },
            style: {},
          },
          {
            id: "n1",
            caption: "",
            labels: ["Movie"],
            properties: {
              title: "String",
            },
            style: {},
          },
        ],
        relationships: [
          {
            id: "n0",
            fromId: "n0",
            toId: "n1",
            type: "ACTED_IN",
            properties: {},
            style: {
              directionality: "undirected",
            },
          },
        ],
      };

      try {
        exportGraphQL(graph);
        throw new Error("asserting this test throws");
      } catch (error) {
        expect(error.message).toEqual(
          "Undirected relationships not supported with GraphQL export."
        );
      }
    });

    it("should throw relationships without a type are not supported", () => {
      const graph = {
        nodes: [
          {
            id: "n0",
            caption: "",
            labels: ["Actor"],
            properties: {
              name: "String",
            },
            style: {},
          },
          {
            id: "n1",
            caption: "",
            labels: ["Movie"],
            properties: {
              title: "String",
            },
            style: {},
          },
        ],
        relationships: [
          {
            id: "n0",
            fromId: "n0",
            toId: "n1",
            properties: {},
          },
        ],
      };

      try {
        exportGraphQL(graph);
        throw new Error("asserting this test throws");
      } catch (error) {
        expect(error.message).toEqual(
          "Relationships without a type are not supported with GraphQL export."
        );
      }
    });

    it("should create simple graphql schema with properties", () => {
      const graph = {
        nodes: [
          {
            id: "n0",
            caption: "",
            labels: ["Actor"],
            properties: {
              name: "String",
            },
            style: {},
          },
          {
            id: "n1",
            caption: "",
            labels: ["Movie"],
            properties: {
              title: "String",
            },
            style: {},
          },
        ],
        relationships: [],
      };

      const received = exportGraphQL(graph);

      const expected = `
        type Actor {
          name: String
        }

        type Movie {
          title: String
        }
      `;

      compare(expected, received);
    });

    it("should create simple graphql schema with a single relationship", () => {
      const graph = {
        nodes: [
          {
            id: "n0",
            caption: "",
            labels: ["Actor"],
            properties: {
              name: "String",
            },
            style: {},
          },
          {
            id: "n1",
            caption: "",
            labels: ["Movie"],
            properties: {
              title: "String",
            },
            style: {},
          },
        ],
        relationships: [
          {
            id: "n0",
            type: "ACTED_IN",
            style: {},
            properties: {},
            fromId: "n0",
            toId: "n1",
          },
        ],
      };

      const received = exportGraphQL(graph);

      const expected = `
        type Actor {
          name: String
          acted_in: Movie @relationship(type: "ACTED_IN", direction: OUT)
        }

        type Movie {
          title: String
          acted_in: Actor @relationship(type: "ACTED_IN", direction: IN)
        }
      `;

      compare(expected, received);
    });

    it("should create node with array properties", () => {
      const graph = {
        nodes: [
          {
            id: "n0",
            caption: "",
            labels: ["Product"],
            properties: {
              barcodes: "[String]!",
            },
            style: {},
          },
        ],
        relationships: [],
      };

      const received = exportGraphQL(graph);

      const expected = `
        type Product {
          barcodes: [String]!
        }
      `;

      compare(expected, received);
    });

    it("should create graphql schema with single array relationship", () => {
      const graph = {
        nodes: [
          {
            id: "n0",
            caption: "",
            labels: ["Actor"],
            properties: {
              name: "String",
            },
            style: {},
          },
          {
            id: "n1",
            caption: "",
            labels: ["Movie"],
            properties: {
              title: "String",
            },
            style: {},
          },
        ],
        relationships: [
          {
            id: "n0",
            type: "[ACTED_IN]",
            style: {},
            properties: {},
            fromId: "n0",
            toId: "n1",
          },
        ],
      };

      const received = exportGraphQL(graph);

      const expected = `
        type Actor {
          name: String
          acted_in: [Movie] @relationship(type: "ACTED_IN", direction: OUT)
        }

        type Movie {
          title: String
          acted_in: [Actor] @relationship(type: "ACTED_IN", direction: IN)
        }
      `;

      compare(expected, received);
    });

    it("should create graphql schema with single non null array relationship", () => {
      const graph = {
        nodes: [
          {
            id: "n0",
            caption: "",
            labels: ["Actor"],
            properties: {
              name: "String!",
            },
            style: {},
          },
          {
            id: "n1",
            caption: "",
            labels: ["Movie"],
            properties: {
              title: "String!",
            },
            style: {},
          },
        ],
        relationships: [
          {
            id: "n0",
            type: "[ACTED_IN]!",
            style: {},
            properties: {},
            fromId: "n0",
            toId: "n1",
          },
        ],
      };

      const received = exportGraphQL(graph);

      const expected = `
        type Actor {
          name: String!
          acted_in: [Movie]! @relationship(type: "ACTED_IN", direction: OUT)
        }

        type Movie {
          title: String!
          acted_in: [Actor]! @relationship(type: "ACTED_IN", direction: IN)
        }
      `;

      compare(expected, received);
    });
  });
});
