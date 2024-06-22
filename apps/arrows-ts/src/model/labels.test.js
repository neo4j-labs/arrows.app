import { combineLabels } from './labels';

it('confirms labels from a single node are self-consistent', () => {
  const nodes = [{ labels: ['a', 'b', 'c'] }];
  expect(combineLabels(nodes)).toEqual({
    a: { status: 'CONSISTENT' },
    b: { status: 'CONSISTENT' },
    c: { status: 'CONSISTENT' },
  });
});

it('combines labels from different nodes', () => {
  const nodes = [{ labels: ['a', 'b', 'c'] }, { labels: ['b', 'c', 'd'] }];
  expect(combineLabels(nodes)).toEqual({
    a: { status: 'PARTIAL' },
    b: { status: 'CONSISTENT' },
    c: { status: 'CONSISTENT' },
    d: { status: 'PARTIAL' },
  });
});
