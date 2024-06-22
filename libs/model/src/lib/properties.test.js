import { combineProperties } from './properties';

it('confirms properties from a single entity are self-consistent', () => {
  const entities = [{ properties: { a: 'a', b: 'b', c: 'c1' } }];
  expect(combineProperties(entities)).toEqual({
    a: { status: 'CONSISTENT', value: 'a' },
    b: { status: 'CONSISTENT', value: 'b' },
    c: { status: 'CONSISTENT', value: 'c1' },
  });
});

it('combines properties from different entities', () => {
  const entities = [
    { properties: { a: 'a', b: 'b', c: 'c1' } },
    { properties: { b: 'b', c: 'c2', d: 'd' } },
  ];
  expect(combineProperties(entities)).toEqual({
    a: { status: 'PARTIAL' },
    b: { status: 'CONSISTENT', value: 'b' },
    c: { status: 'INCONSISTENT' },
    d: { status: 'PARTIAL' },
  });
});
