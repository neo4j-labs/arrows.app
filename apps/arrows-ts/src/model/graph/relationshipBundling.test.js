import { bundle } from './relationshipBundling';

it('should return no bundles when there are no relationships', () => {
  const bundles = bundle([]);
  expect(bundles).toEqual([]);
});

it('should put both relationships in the same bundle when they connect the same two nodes', () => {
  const bundles = bundle([
    { from: { id: 'n1' }, to: { id: 'n2' } },
    { from: { id: 'n2' }, to: { id: 'n1' } },
  ]);
  expect(bundles).toEqual([
    [
      { from: { id: 'n1' }, to: { id: 'n2' } },
      { from: { id: 'n2' }, to: { id: 'n1' } },
    ],
  ]);
});

it('should put relationships in different bundles when they connect different nodes', () => {
  const bundles = bundle([
    { from: { id: 'n1' }, to: { id: 'n2' } },
    { from: { id: 'n2' }, to: { id: 'n1' } },
    { from: { id: 'n1' }, to: { id: 'n3' } },
    { from: { id: 'n2' }, to: { id: 'n3' } },
  ]);
  expect(bundles).toEqual([
    [
      { from: { id: 'n1' }, to: { id: 'n2' } },
      { from: { id: 'n2' }, to: { id: 'n1' } },
    ],
    [{ from: { id: 'n1' }, to: { id: 'n3' } }],
    [{ from: { id: 'n2' }, to: { id: 'n3' } }],
  ]);
});

it('should cope with self relationships', () => {
  const bundles = bundle([
    { from: { id: 'n1' }, to: { id: 'n2' } },
    { from: { id: 'n2' }, to: { id: 'n2' } },
  ]);
  expect(bundles).toEqual([
    [{ from: { id: 'n1' }, to: { id: 'n2' } }],
    [{ from: { id: 'n2' }, to: { id: 'n2' } }],
  ]);
});
