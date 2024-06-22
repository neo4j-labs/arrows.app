import extractNameFromTypeNode from './extractNameFromTypeNode';

describe('graphql', () => {
  describe('extractNameFromTypeNode', () => {
    test('should return NamedNode name', () => {
      const expected = 'Movie';

      /**
       * @type {import("graphql").TypeNode}
       */
      const typeNode = {
        kind: 'NamedType',
        name: { kind: 'Name', value: expected },
      };

      const received = extractNameFromTypeNode(typeNode);

      expect(received).toEqual(expected);
    });

    test('should return ListType name', () => {
      const expected = 'Movie';

      /**
       * @type {import("graphql").TypeNode}
       */
      const typeNode = {
        kind: 'ListType',
        type: {
          kind: 'NamedType',
          name: { kind: 'Name', value: expected },
        },
      };

      const received = extractNameFromTypeNode(typeNode);

      expect(received).toEqual(expected);
    });

    test('should return NonNullType name', () => {
      const expected = 'Movie';

      /**
       * @type {import("graphql").TypeNode}
       */
      const typeNode = {
        kind: 'NonNullType',
        type: {
          kind: 'NamedType',
          name: { kind: 'Name', value: expected },
        },
      };

      const received = extractNameFromTypeNode(typeNode);

      expect(received).toEqual(expected);
    });
  });
});
