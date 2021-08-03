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

    it("should return larger blog schema with many nodes and relationships", () => {
      const graph = {
        style: {},
        nodes: [
          {
            id: "n0",
            caption: "",
            style: {},
            labels: ["Post"],
            properties: {
              title: "String",
            },
          },
          {
            id: "n1",
            caption: "",
            style: {},
            labels: ["User"],
            properties: {
              name: "String",
            },
          },
          {
            id: "n2",
            caption: "",
            style: {},
            labels: ["Comment"],
            properties: {
              content: "String",
            },
          },
          {
            id: "n3",
            caption: "",
            style: {},
            labels: ["Blog"],
            properties: {
              name: "String",
            },
          },
        ],
        relationships: [
          {
            id: "n0",
            type: "[POSTED]",
            style: {},
            properties: {},
            fromId: "n1",
            toId: "n0",
          },
          {
            id: "n1",
            type: "[HAS_COMMENT]",
            style: {},
            properties: {},
            fromId: "n0",
            toId: "n2",
          },
          {
            id: "n2",
            type: "[COMMENTED]",
            style: {},
            properties: {},
            fromId: "n1",
            toId: "n2",
          },
          {
            id: "n3",
            type: "[HAS_POST]",
            style: {},
            properties: {},
            fromId: "n3",
            toId: "n0",
          },
          {
            id: "n4",
            type: "[HAS_BLOG]",
            style: {},
            properties: {},
            fromId: "n1",
            toId: "n3",
          },
        ],
      };

      const received = exportGraphQL(graph);

      const expected = `
        type Post {
          title: String
          has_comment: [Comment] @relationship(type: "HAS_COMMENT", direction: OUT)
          posted: [User] @relationship(type: "POSTED", direction: IN)
          has_post: [Blog] @relationship(type: "HAS_POST", direction: IN)
        }

        type User {
          name: String
          posted: [Post] @relationship(type: "POSTED", direction: OUT)
          commented: [Comment] @relationship(type: "COMMENTED", direction: OUT)
          has_blog: [Blog] @relationship(type: "HAS_BLOG", direction: OUT)
        }
        
        type Comment {
          content: String
          has_comment: [Post] @relationship(type: "HAS_COMMENT", direction: IN)
          commented: [User] @relationship(type: "COMMENTED", direction: IN)
        }
        
        type Blog {
          name: String
          has_blog: [User] @relationship(type: "HAS_BLOG", direction: IN)
          has_post: [Post] @relationship(type: "HAS_POST", direction: OUT)
        }
      `;

      compare(expected, received);
    });
    it("should return relationship properties", () => {
      const graph = {
        style: {},
        nodes: [
          {
            id: "n0",
            caption: "",
            style: {},
            labels: ["Human"],
            properties: {
              name: "String!",
            },
          },
          {
            id: "n1",
            caption: "",
            style: {},
            labels: ["Dog"],
            properties: {
              name: "String!",
            },
          },
        ],
        relationships: [
          {
            id: "n0",
            type: "[LOVES]",
            style: {},
            properties: {
              since: "DateTime!",
            },
            fromId: "n0",
            toId: "n1",
          },
          {
            id: "n1",
            type: "OWNED_BY",
            style: {},
            properties: {
              boughtAt: "DateTime!",
              price: "Float",
            },
            fromId: "n1",
            toId: "n0",
          },
        ],
      };

      const received = exportGraphQL(graph);

      const expected = `
        type Human {
          name: String!
          loves: [Dog] @relationship(type: "LOVES", direction: OUT, properties: "Loves")
          owned_by: Dog @relationship(type: "OWNED_BY", direction: IN, properties: "OwnedBy")
        }

        type Dog {
          name: String!
          loves: [Human] @relationship(type: "LOVES", direction: IN, properties: "Loves")
          owned_by: Human @relationship(type: "OWNED_BY", direction: OUT, properties: "OwnedBy")
        }

        interface Loves {
          since: DateTime!
        }

        interface OwnedBy {
          boughtAt: DateTime!
          price: Float
        }
      `;

      compare(expected, received);
    });
  });
});
