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
          actedInMovie: Movie @relationship(type: "ACTED_IN", direction: OUT)
        }

        type Movie {
          title: String
          actorActedIn: Actor @relationship(type: "ACTED_IN", direction: IN)
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
          actedInMovie: [Movie] @relationship(type: "ACTED_IN", direction: OUT)
        }

        type Movie {
          title: String
          actorActedIn: [Actor] @relationship(type: "ACTED_IN", direction: IN)
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
          actedInMovie: [Movie]! @relationship(type: "ACTED_IN", direction: OUT)
        }

        type Movie {
          title: String!
          actorActedIn: [Actor]! @relationship(type: "ACTED_IN", direction: IN)
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
          hasCommentComment: [Comment] @relationship(type: "HAS_COMMENT", direction: OUT)
          userPosted: [User] @relationship(type: "POSTED", direction: IN)
          blogHasPost: [Blog] @relationship(type: "HAS_POST", direction: IN)
        }

        type User {
          name: String
          postedPost: [Post] @relationship(type: "POSTED", direction: OUT)
          commentedComment: [Comment] @relationship(type: "COMMENTED", direction: OUT)
          hasBlogBlog: [Blog] @relationship(type: "HAS_BLOG", direction: OUT)
        }
        
        type Comment {
          content: String
          postHasComment: [Post] @relationship(type: "HAS_COMMENT", direction: IN)
          userCommented: [User] @relationship(type: "COMMENTED", direction: IN)
        }
        
        type Blog {
          name: String
          userHasBlog: [User] @relationship(type: "HAS_BLOG", direction: IN)
          hasPostPost: [Post] @relationship(type: "HAS_POST", direction: OUT)
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
          lovesDog: [Dog] @relationship(type: "LOVES", direction: OUT, properties: "Loves")
          dogOwnedBy: Dog @relationship(type: "OWNED_BY", direction: IN, properties: "OwnedBy")
        }

        type Dog {
          name: String!
          humanLoves: [Human] @relationship(type: "LOVES", direction: IN, properties: "Loves")
          ownedByHuman: Human @relationship(type: "OWNED_BY", direction: OUT, properties: "OwnedBy")
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
    it("should create unique interface names per relationship", () => {
      const graph = {
        style: {},
        nodes: [
          {
            id: "n0",
            caption: "",
            labels: ["Movie"],
            properties: {
              title: "String",
            },
            style: {},
          },
          {
            id: "n1",
            caption: "",
            labels: ["Actor"],
            properties: {
              name: "String",
            },
            style: {},
          },
          {
            id: "n2",
            caption: "",
            style: {},
            labels: ["Animal"],
            properties: {
              name: "String",
            },
          },
        ],
        relationships: [
          {
            id: "n0",
            fromId: "n1",
            toId: "n0",
            type: "[ACTED_IN]",
            properties: {
              screenTime: "Int",
            },
            style: {},
          },
          {
            id: "n1",
            type: "[ACTED_IN]",
            style: {},
            properties: {
              screenTime: "Int",
            },
            fromId: "n2",
            toId: "n0",
          },
        ],
      };

      const received = exportGraphQL(graph);

      const expected = `
        type Movie {
          title: String
          actorActedIn: [Actor] @relationship(type: "ACTED_IN", direction: IN, properties: "ActedIn")
          animalActedIn: [Animal] @relationship(type: "ACTED_IN", direction: IN, properties: "ActedIn1")
        }
        type Actor {
          name: String
          actedInMovie: [Movie] @relationship(type: "ACTED_IN", direction: OUT, properties: "ActedIn")
        }
        type Animal {
          name: String
          actedInMovie: [Movie] @relationship(type: "ACTED_IN", direction: OUT, properties: "ActedIn1")
        }
        interface ActedIn {
          screenTime: Int
        }
        interface ActedIn1 {
          screenTime: Int
        }
      `;

      compare(expected, received);
    });

    // New test for property value type inference
    it("should correctly infer property types from values", () => {
      const graph = {
        nodes: [
          {
            id: "n0",
            caption: "",
            labels: ["Customer"],
            properties: {
              name: "John Smith",
              age: "42",
              vip: "true",
              balance: "123.45",
              id: "CUST-001"
            },
            style: {},
          },
          {
            id: "n1",
            caption: "",
            labels: ["Order"],
            properties: {
              id: "ORD-001",
              total: "99.99",
              items: "3",
              status: "PENDING"
            },
            style: {},
          }
        ],
        relationships: [
          {
            id: "n0",
            fromId: "n1",
            toId: "n0",
            type: "PLACED_BY",
            properties: {
              timestamp: "2023-05-12",
              confirmed: "true"
            },
            style: {},
          }
        ],
      };

      const received = exportGraphQL(graph);

      const expected = `
        type Customer {
          name: String
          age: Int
          vip: Boolean
          balance: Float
          id: String
          orderPlacedBy: Order @relationship(type: "PLACED_BY", direction: IN, properties: "PlacedBy")
        }

        type Order {
          id: String
          total: Float
          items: Int
          status: String
          placedByCustomer: Customer @relationship(type: "PLACED_BY", direction: OUT, properties: "PlacedBy")
        }

        interface PlacedBy {
          timestamp: String
          confirmed: Boolean
        }
      `;

      compare(expected, received);
    });

    it("should correctly infer property types from values", () => {
      const graph = {
        nodes: [
          {
            id: "n0",
            caption: "",
            labels: ["Customer"],
            properties: {
              name: "John Smith",
              age: "42",
              vip: "true",
              balance: "123.45",
              id: "CUST-001",
            },
            style: {},
          },
          {
            id: "n1",
            caption: "",
            labels: ["Order"],
            properties: {
              id: "ORD-001",
              total: "99.99",
              items: "3",
              status: "PENDING",
            },
            style: {},
          },
        ],
        relationships: [
          {
            id: "n0",
            fromId: "n1",
            toId: "n0",
            type: "PLACED_BY",
            properties: {
              timestamp: "2023-05-12",
              confirmed: "true",
            },
            style: {},
          },
        ],
      };

      const received = exportGraphQL(graph);

      const expected = `
          type Customer {
            name: String
            age: Int
            vip: Boolean
            balance: Float
            id: String
            orderPlacedBy: Order @relationship(type: "PLACED_BY", direction: IN, properties: "PlacedBy")
          }

          type Order {
            id: String
            total: Float
            items: Int
            status: String
            placedByCustomer: Customer @relationship(type: "PLACED_BY", direction: OUT, properties: "PlacedBy")
          }

          interface PlacedBy {
            timestamp: String
            confirmed: Boolean
          }
        `;

      compare(expected, received);
    });
  });
});
