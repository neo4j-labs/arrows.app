import typeStringToTypeNode from './typeStringToTypeNode';

describe('graphql', () => {
  describe('typeStringToTypeNode', () => {
    it('should return NamedType', () => {
      const received = typeStringToTypeNode('Movie');

      const expected = {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'Movie' },
      };

      expect(received).toEqual(expected);
    });

    it('should return ListType', () => {
      const received = typeStringToTypeNode('[Movie]');

      const expected = {
        kind: 'ListType',
        type: { kind: 'NamedType', name: { kind: 'Name', value: 'Movie' } },
      };

      expect(received).toEqual(expected);
    });

    it('should return NonNullType', () => {
      const received = typeStringToTypeNode('Movie!');

      const expected = {
        kind: 'NonNullType',
        type: { kind: 'NamedType', name: { kind: 'Name', value: 'Movie' } },
      };

      expect(received).toEqual(expected);
    });

    it('should return NonNullType - ListType', () => {
      const received = typeStringToTypeNode('[Movie]!');

      const expected = {
        kind: 'NonNullType',
        type: {
          kind: 'ListType',
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Movie' } },
        },
      };

      expect(received).toEqual(expected);
    });
  });
});
